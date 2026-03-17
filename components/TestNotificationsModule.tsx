// components/TestNotificationsModule.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell, Send, User, Smartphone, Settings2, Info } from "lucide-react";
import { fetchClientes } from "@/app/admin/clientes/services/cliente.service";
import { fetchMotorizados } from "@/app/admin/motorizado/services/motorizado.service";
import { fetchSocios } from "@/app/admin/socios/services/Socios.service";
import { sendLiveActivityTest, sendPushTest } from "@/app/admin/notificaciones/services/notification-test.service";
import { showAlert } from "@/components/ui/DataTable/Alert";

type UserType = "cliente" | "motorizado" | "socio";

const TestNotificationsModule: React.FC = () => {
  const [userType, setUserType] = useState<UserType>("cliente");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [idPedido, setIdPedido] = useState("974");
  const [estado, setEstado] = useState("2");
  const [tiempo, setTiempo] = useState("30");
  const [progress, setProgress] = useState("0.2");
  const [sonido, setSonido] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Queries
  const { data: clientes = [], isLoading: loadingClientes } = useQuery({
    queryKey: ["clientes-test"],
    queryFn: fetchClientes,
    enabled: userType === "cliente",
  });

  const { data: motorizados = [], isLoading: loadingMotorizados } = useQuery({
    queryKey: ["motorizados-test"],
    queryFn: fetchMotorizados,
    enabled: userType === "motorizado",
  });

  const { data: socios = [], isLoading: loadingSocios } = useQuery({
    queryKey: ["socios-test"],
    queryFn: fetchSocios,
    enabled: userType === "socio",
  });

  // Get current users based on type and search
  const getCurrentUsers = () => {
    let list: any[] = [];
    if (userType === "cliente") list = clientes;
    else if (userType === "motorizado") list = motorizados;
    else if (userType === "socio") list = socios;

    if (!searchTerm) return list;
    
    const term = searchTerm.toLowerCase();
    return list.filter(u => {
      const name = (u.nombre || u.nombres || u.name || "").toLowerCase();
      const lastName = (u.apellido || u.apellidos || u.lastName || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const phone = (u.celular || u.phone || "").toLowerCase();
      return name.includes(term) || lastName.includes(term) || email.includes(term) || phone.includes(term);
    });
  };

  const users = getCurrentUsers();
  const selectedUser = users.find(u => u.id.toString() === selectedUserId);
  const token = selectedUser?.token_fmc || selectedUser?.token_fcm || "";

  const handleSend = async () => {
    if (!token) {
      showAlert({
        title: "Error",
        text: "El usuario seleccionado no tiene un token de notificación activo.",
        icon: "warning"
      });
      return;
    }

    setLoading(true);
    try {
      if (userType === "cliente") {
        await sendLiveActivityTest({
          token,
          id_pedido: idPedido,
          estado,
          tiempo,
          progress,
        });
      } else {
        const channel_id = userType === "motorizado" ? "pedidos_v7" : "pedidos_v3";
        await sendPushTest({
          token,
          sonido: sonido.toString(),
          channel_id,
        });
      }

      showAlert({
        title: "¡Enviado!",
        text: "La notificación de prueba ha sido enviada con éxito.",
        icon: "success"
      });
    } catch (error: any) {
      showAlert({
        title: "Error de Envío",
        text: error.message || "No se pudo enviar la notificación.",
        icon: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Card */}
      <Card className="lg:col-span-2 shadow-md">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-red-500" />
            <CardTitle>Configuración de Prueba</CardTitle>
          </div>
          <CardDescription>
            Selecciona el tipo de usuario y el mensaje que deseas enviar.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="user-type">Tipo de Usuario</Label>
              <Select value={userType} onValueChange={(val: UserType) => {
                setUserType(val);
                setSelectedUserId("");
                setSearchTerm("");
              }}>
                <SelectTrigger id="user-type" className="h-11">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente (Live Activity)</SelectItem>
                  <SelectItem value="motorizado">Motorizado (Canal pedidos_v7)</SelectItem>
                  <SelectItem value="socio">Socio (Canal pedidos_v3)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-search">Buscar Usuario</Label>
              <Input
                id="user-search"
                placeholder="Nombre, email o celular..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="selected-user">Lista de Usuarios ({users.length})</Label>
            <div className="border rounded-md max-h-[250px] overflow-y-auto">
              {(loadingClientes || loadingMotorizados || loadingSocios) ? (
                <div className="p-4 text-center text-gray-500">Cargando usuarios...</div>
              ) : users.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No se encontraron usuarios con token.</div>
              ) : (
                <div className="divide-y text-sm">
                  {users.map(u => (
                    <div 
                      key={u.id} 
                      onClick={() => setSelectedUserId(u.id.toString())}
                      className={`p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center ${selectedUserId === u.id.toString() ? 'bg-red-50 border-l-4 border-red-500' : ''}`}
                    >
                      <div>
                        <p className="font-semibold">{u.nombre || u.nombres || u.name} {u.apellido || u.apellidos || u.lastName}</p>
                        <p className="text-xs text-gray-500 italic">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {u.token_fmc || u.token_fcm ? (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">CON TOKEN</span>
                        ) : (
                          <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-bold">SIN TOKEN</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {userType === "cliente" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-red-50/50 p-4 rounded-lg border border-red-100">
              <div className="space-y-2">
                <Label htmlFor="id-pedido">ID Pedido</Label>
                <Input id="id-pedido" value={idPedido} onChange={(e) => setIdPedido(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger id="estado">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Confirmado (2)</SelectItem>
                    <SelectItem value="3">Preparando (3)</SelectItem>
                    <SelectItem value="4">Enviado (4)</SelectItem>
                    <SelectItem value="5">En el lugar (5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiempo">Tiempo (min)</Label>
                <Input id="tiempo" value={tiempo} onChange={(e) => setTiempo(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="progress">Progreso (0-1)</Label>
                <Input id="progress" value={progress} onChange={(e) => setProgress(e.target.value)} placeholder="0.5" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-semibold text-sm">Sonido Personalizado</p>
                  <p className="text-xs text-blue-600">Envía la notificación con el sonido de la app.</p>
                </div>
              </div>
              <Switch checked={sonido} onCheckedChange={setSonido} />
            </div>
          )}

          <Button 
            className="w-full h-12 text-lg font-bold shadow-lg shadow-red-100" 
            disabled={loading || !selectedUserId}
            onClick={handleSend}
            variant="destructive"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white" />
                ENVIANDO...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send size={20} />
                ENVIAR NOTIFICACIÓN DE PRUEBA
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Summary / Token Info */}
      <Card className="shadow-md h-fit lg:sticky lg:top-4">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
             <Info className="w-5 h-5 text-blue-500" />
             Resumen del Envío
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-gray-500 uppercase font-bold">Usuario</Label>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
              <User size={16} className="text-gray-400" />
              <span className="text-sm font-medium">
                {selectedUser ? `${selectedUser.nombre || selectedUser.nombres || selectedUser.name} ${selectedUser.apellido || selectedUser.apellidos || selectedUser.lastName}` : "No seleccionado"}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-gray-500 uppercase font-bold">Dispositivo (Token)</Label>
            <div className="p-2 bg-gray-50 rounded border break-all">
              <div className="flex items-center gap-2 mb-1">
                 <Smartphone size={16} className="text-gray-400" />
                 <span className="text-xs font-bold text-gray-400">FCM TOKEN</span>
              </div>
              <p className="text-[10px] font-mono leading-tight">
                {token || "Sin token disponible"}
              </p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-xs space-y-2">
            <p className="font-bold text-yellow-800 uppercase flex items-center gap-1">
              <Info size={14} /> Importante
            </p>
            <ul className="list-disc pl-4 space-y-1 text-yellow-700">
              <li>Las notificaciones solo llegarán si el usuario ha aceptado permisos.</li>
              <li>Live Activities solo funcionan en dispositivos iOS compatibles.</li>
              <li>El motorizado debe tener la app abierta o en segundo plano.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestNotificationsModule;
