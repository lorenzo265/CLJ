import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-semibold">CLJ NSR</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Departamento Cultural
            <br />
            Paróquia Nossa Senhora do Rosário
          </p>
        </div>

        <Card>
          <CardHeader className="sr-only">
            <CardTitle>Entrar</CardTitle>
            <CardDescription>Acesse com seu e-mail e senha</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="voce@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" type="password" placeholder="••••••••" />
            </div>
            <Button render={<Link href="/escala" />} nativeButton={false} className="w-full" size="lg">
              Entrar
            </Button>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Separator />
            <p className="text-center text-sm text-muted-foreground">
              Recebeu um convite do coordenador?{" "}
              <Link href="/cadastro" className="font-medium text-primary underline-offset-4 hover:underline">
                Defina sua senha aqui
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
