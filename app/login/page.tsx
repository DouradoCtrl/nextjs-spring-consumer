import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <div className="size-20 my-8 mx-auto">
              <img src="logo.svg" alt="Logo" />
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative bg-neutral-200 hidden dark:bg-neutral-900 lg:block">
        <img
          src="Business Plan-amico dark.svg"
          alt="Image"
          className="absolute inset-0 h-full w-[50vw]"
        />
      </div>
    </div>
  );
}
