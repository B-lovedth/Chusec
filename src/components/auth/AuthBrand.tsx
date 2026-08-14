import Image from "next/image";

type AuthBrandProps = {
  title: string;
};

export function AuthBrand({ title }: AuthBrandProps) {
  return (
    <>
      <div className="auth-brand">
        <Image src="/logo.png" alt="Chusec" width={103} height={40} priority />
      </div>
      <h1 className="auth-title">{title}</h1>
    </>
  );
}
