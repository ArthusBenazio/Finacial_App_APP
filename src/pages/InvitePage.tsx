import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { http } from "@/lib/http";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Users } from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface InviteDetails {
  id: string;
  email: string;
  token: string;
  senderId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  expiresAt: string;
}

export function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { token: authToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchInvite() {
      try {
        const response = await http.get<{ invite: InviteDetails }>(`/invites/${token}`);
        setInvite(response.data.invite);
      } catch (err: any) {
        setError(err.response?.data?.message || "Convite não encontrado ou expirado.");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchInvite();
    }
  }, [token]);

  const handleAccept = async () => {
    if (!authToken) {
      // If not logged in, send to register/login with a redirect back
      navigate(`/register?invite=${token}`);
      return;
    }

    setIsAccepting(true);
    try {
      await http.post(`/invites/${token}/accept`);
      setSuccess(true);
      setTimeout(() => navigate('/select-group'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao aceitar convite.");
    } finally {
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg animate-in zoom-in-95 duration-300">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Você foi convidado!</CardTitle>
          <CardDescription>
            {invite ? `${invite.email}, junte-se a este perfil financeiro compartilhado.` : 'Link de convite para grupo.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {error ? (
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive flex flex-col items-center gap-2 text-center">
              <XCircle className="w-8 h-8" />
              <p className="font-medium">{error}</p>
              <Button variant="ghost" className="mt-2" onClick={() => navigate('/login')}>Ir para Login</Button>
            </div>
          ) : success ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600 flex flex-col items-center gap-2 text-center">
              <CheckCircle2 className="w-8 h-8" />
              <p className="font-medium text-lg">Convite Aceito!</p>
              <p className="text-sm">Redirecionando para seleção de perfil...</p>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <p className="text-sm text-center text-muted-foreground">
                  Ao aceitar, você terá acesso completo às contas, transações e orçamentos deste grupo.
                </p>
              </div>
              <Button 
                className="w-full h-12 rounded-full text-base font-bold gap-2" 
                onClick={handleAccept}
                disabled={isAccepting}
              >
                {isAccepting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Aceitar Convite e Entrar"}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                {authToken ? "Você está logado. O convite será vinculado à sua conta atual." : "Você precisará criar uma conta ou fazer login para continuar."}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
