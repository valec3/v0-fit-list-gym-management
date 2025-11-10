"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MemberLayout } from "@/components/member-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { Download, RefreshCw } from "lucide-react";

export default function MemberQRPage() {
  const router = useRouter();
  const [memberData, setMemberData] = useState<any>(null);
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    // Verificar sesión
    const session = localStorage.getItem("member_session");
    if (!session) {
      router.push("/member/login");
      return;
    }

    const sessionData = JSON.parse(session);

    // Mock data del socio
    const member = {
      id: sessionData.id,
      name: "Juan Pérez",
      email: sessionData.email,
    };

    setMemberData(member);

    // Generar código QR con información del socio
    const qrData = {
      member_id: member.id,
      timestamp: Date.now(),
    };
    setQrValue(JSON.stringify(qrData));
  }, [router]);

  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `fitlist-qr-${memberData.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleRefreshQR = () => {
    if (!memberData) return;

    const qrData = {
      member_id: memberData.id,
      timestamp: Date.now(),
    };
    setQrValue(JSON.stringify(qrData));
  };

  if (!memberData) {
    return null;
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Mi Código QR
          </h1>
          <p className="text-muted-foreground">
            Usa este código para registrar tu entrada al gimnasio
          </p>
        </div>

        {/* QR Code Card */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Código de Acceso</CardTitle>
              <CardDescription>
                {memberData.name} - {memberData.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code */}
              <div className="flex justify-center rounded-lg bg-white p-6">
                <QRCode id="qr-code" value={qrValue} size={256} level="H" />
              </div>

              {/* Instructions */}
              <div className="space-y-2 rounded-lg bg-muted p-4">
                <h3 className="font-semibold text-foreground">
                  Cómo usar tu código QR:
                </h3>
                <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                  <li>Muestra este código en la recepción del gimnasio</li>
                  <li>
                    El personal escaneará tu código para registrar tu entrada
                  </li>
                  <li>También puedes descargarlo y tenerlo en tu galería</li>
                  <li>El código se actualiza automáticamente por seguridad</li>
                </ol>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1 gap-2" onClick={handleDownloadQR}>
                  <Download className="h-4 w-4" />
                  Descargar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 bg-transparent"
                  onClick={handleRefreshQR}
                >
                  <RefreshCw className="h-4 w-4" />
                  Actualizar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información Importante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              • Tu código QR es personal e intransferible. No lo compartas con
              otras personas para mantener la seguridad del gimnasio.
            </p>
            <p>
              • Si tienes problemas con el escaneo, puedes proporcionar tu email
              ({memberData.email}) en recepción.
            </p>
            <p>
              • El código se regenera periódicamente por motivos de seguridad.
            </p>
            <p>
              • Asegúrate de que tu membresía esté activa antes de intentar
              acceder al gimnasio.
            </p>
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
}
