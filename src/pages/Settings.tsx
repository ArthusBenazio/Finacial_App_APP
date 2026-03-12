import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Shield, 
  Smartphone, 
  CreditCard, 
  Globe,
  ChevronRight,
  LogOut
} from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm">Gerencie sua conta, preferências e segurança.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Lateral de Configurações */}
        <aside className="lg:col-span-1 space-y-2">
          <Button variant="secondary" className="w-full justify-start gap-3 h-11 bg-primary/10 text-primary hover:bg-primary/20">
            <User className="w-4 h-4" /> Perfil
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-11">
            <Bell className="w-4 h-4" /> Notificações
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-11">
            <Shield className="w-4 h-4" /> Segurança & Senha
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-11">
            <CreditCard className="w-4 h-4" /> Plano & Assinatura
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-11 text-rose-500 hover:text-rose-600 hover:bg-rose-50">
            <LogOut className="w-4 h-4" /> Sair da Conta
          </Button>
        </aside>

        {/* Conteúdo da Configuração */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
              <CardDescription>Atualize seus dados de perfil e como os outros te veem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" defaultValue="João Silva" className="bg-muted/30 border-none h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" defaultValue="joao.silva@exemplo.com" className="bg-muted/30 border-none h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="Uma breve descrição sobre você" className="bg-muted/30 border-none h-11" />
              </div>
              <Button className="rounded-xl px-8 h-11 font-bold">Salvar Alterações</Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Preferências do App</CardTitle>
              <CardDescription>Personalize sua experiência de uso e privacidade.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Modo Privado Automático</Label>
                  <p className="text-xs text-muted-foreground">Ocultar valores sempre que o app for iniciado.</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações Push</Label>
                  <p className="text-xs text-muted-foreground">Receba alertas de gastos e orçamentos estourados.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="space-y-0.5">
                  <Label className="text-base">Moeda Principal</Label>
                  <p className="text-xs text-muted-foreground">Real Brasileiro (BRL - R$)</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">App Mobile</p>
                <p className="text-[11px] text-muted-foreground">Acesse suas finanças de qualquer lugar.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full text-[11px] font-bold">Baixar Agora</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
