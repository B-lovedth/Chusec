/**
 * Ambient audio capture for the SOS duress flow.
 *
 * The backend hands back `duress_recording_status` / `duress_recording_until`
 * on the SOS response, so the recording window is the server's decision — this
 * module only performs the capture and hands back a file to upload.
 *
 * Capture is gated by the browser's microphone permission prompt, which is the
 * only disclosure the user gets before recording starts. Everything here fails
 * soft: no microphone, a denied prompt or an unsupported browser all resolve to
 * `null` rather than throwing, because none of that should block an SOS.
 */

export type DuressRecording = {
  /** Resolves with the captured clip, or null if nothing usable was recorded. */
  stop: () => Promise<File | null>;
};

/** First container the browser admits to supporting, best quality first. */
function pickMimeType(): string | undefined {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

function extensionFor(mimeType: string) {
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

export async function startDuressRecording(): Promise<DuressRecording | null> {
  if (typeof window === "undefined") return null;
  if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) return null;

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    // Denied or no device — the SOS itself still goes out.
    return null;
  }

  const mimeType = pickMimeType();
  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  } catch {
    stream.getTracks().forEach((track) => track.stop());
    return null;
  }

  const chunks: Blob[] = [];
  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });
  recorder.start();

  let settled = false;

  const stop = () =>
    new Promise<File | null>((resolve) => {
      // Guards a second stop() from a cancel racing the deadline timer.
      if (settled) {
        resolve(null);
        return;
      }
      settled = true;

      const release = () => stream.getTracks().forEach((track) => track.stop());

      if (recorder.state === "inactive") {
        release();
        resolve(null);
        return;
      }

      recorder.addEventListener(
        "stop",
        () => {
          release();

          if (chunks.length === 0) {
            resolve(null);
            return;
          }

          const type = recorder.mimeType || mimeType || "audio/webm";
          const blob = new Blob(chunks, { type });
          resolve(
            new File([blob], `duress-${Date.now()}.${extensionFor(type)}`, {
              type,
            }),
          );
        },
        { once: true },
      );

      recorder.stop();
    });

  return { stop };
}
