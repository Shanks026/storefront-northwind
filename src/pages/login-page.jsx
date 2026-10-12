import { useState } from "react"
import { Link, useSearchParams } from "react-router"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { validateCredentials } from "@/api/auth"
import { AuthLayout } from "@/components/auth/auth-layout"
import { FormField } from "@/components/auth/form-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useSignIn } from "@/hooks/use-auth"

/** Keeps ?redirect when hopping between /login and /register. */
export function withRedirect(path, params) {
  const redirect = params.get("redirect")
  return redirect ? `${path}?redirect=${encodeURIComponent(redirect)}` : path
}

export function LoginPage() {
  const [params] = useSearchParams()
  const signIn = useSignIn()
  const [values, setValues] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }))
  }

  function submit(e) {
    e.preventDefault()
    const clientErrors = validateCredentials(values)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length) return

    // on success <GuestOnly> sends the user to ?redirect (or home)
    signIn.mutate(values, {
      onSuccess: ({ user }) => toast.success(`Welcome back, ${user.name.split(" ")[0]}!`),
      onError: (err) => setErrors(err.fields ?? {}),
    })
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle={params.get("redirect") ? "Sign in to continue where you left off." : "Welcome back. Sign in to your account."}
      footer={
        <>
          New to the store?{" "}
          <Link to={withRedirect("/register", params)} className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {signIn.isError && !signIn.error.fields && (
          <Alert variant="destructive">
            <AlertDescription>{signIn.error.message}</AlertDescription>
          </Alert>
        )}
        <FormField label="Email" type="email" autoComplete="email" value={values.email} onChange={set("email")} error={errors.email} autoFocus />
        <FormField label="Password" type="password" autoComplete="current-password" value={values.password} onChange={set("password")} error={errors.password} />
        <Button type="submit" className="h-10 w-full" disabled={signIn.isPending}>
          {signIn.isPending && <Loader2 className="animate-spin" />}
          {signIn.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  )
}
