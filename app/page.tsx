"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dumbbell, LogIn } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulación de login - aquí puedes agregar tu lógica real de autenticación
    // Por ahora, cualquier credencial redirige al admin
    setTimeout(() => {
      if (username && password) {
        router.push("/admin");
      } else {
        setError("Por favor ingresa usuario y contraseña");
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center gap-3">
            <Dumbbell className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              FitList
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-md">
            Sistema de gestión para gimnasios
          </p>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <LogIn className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Iniciar Sesión</CardTitle>
                <CardDescription>
                  Acceso al panel de administración
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
