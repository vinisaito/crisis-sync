import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertData } from './Dashboard';

interface MonitoringCardsProps {
  alertData: AlertData[];
  onCardFilter: (filterType: string) => void;
  activeFilter: string | null;
}

export const MonitoringCards = ({ alertData, onCardFilter, activeFilter }: MonitoringCardsProps) => {
  // Calculate metrics based on the new API structure
  const sev4Incidents = alertData.filter(alert => 
    alert.tipo.toLowerCase() === 'incidente' && 
    (alert.severidade.includes('4') || alert.severidade.includes('5'))
  ).length;
  
  const sev4Alerts = alertData.filter(alert => 
    alert.tipo.toLowerCase() === 'solicitação' && 
    (alert.severidade.includes('4') || alert.severidade.includes('5'))
  ).length;
  
  const sev3Incidents = alertData.filter(alert => 
    alert.tipo.toLowerCase() === 'incidente' && 
    alert.severidade.includes('3')
  ).length;

  const pendingSev4Incidents = alertData.filter(alert => 
    alert.tipo.toLowerCase() === 'incidente' && 
    (alert.severidade.includes('4') || alert.severidade.includes('5')) &&
    (!alert.e0 || alert.e0 === 'N/A' || alert.e0.trim() === '')
  ).length;

  const pendingSev4Alerts = alertData.filter(alert => 
    alert.tipo.toLowerCase() === 'solicitação' && 
    (alert.severidade.includes('4') || alert.severidade.includes('5')) &&
    (!alert.e0 || alert.e0 === 'N/A' || alert.e0.trim() === '')
  ).length;

  const pendingSev3Incidents = alertData.filter(alert => 
    alert.tipo.toLowerCase() === 'incidente' && 
    alert.severidade.includes('3') &&
    (!alert.e0 || alert.e0 === 'N/A' || alert.e0.trim() === '')
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-none">
      {/* SEV4 Incidents */}
      <div className="space-y-4">
        <Card 
          className={`bg-panel-bg border-sev4-incident/20 hover:border-sev4-incident/40 transition-colors cursor-pointer ${
            activeFilter === 'sev4-incidents' ? 'ring-2 ring-sev4-incident/50' : ''
          }`}
          onClick={() => onCardFilter('sev4-incidents')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sev4-incident text-sm font-medium uppercase tracking-wide">
              Incidentes SEV4
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-sev4-incident mb-2">
              {sev4Incidents}
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`bg-panel-bg/50 border-sev4-incident/10 cursor-pointer ${
            activeFilter === 'pending-sev4-incidents' ? 'ring-2 ring-sev4-incident/50' : ''
          }`}
          onClick={() => onCardFilter('pending-sev4-incidents')}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pendente Acionamento</span>
              <span className="text-lg font-semibold text-sev4-incident">
                {pendingSev4Incidents}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEV4 Alerts */}
      <div className="space-y-4">
        <Card 
          className={`bg-panel-bg border-sev4-alert/20 hover:border-sev4-alert/40 transition-colors cursor-pointer ${
            activeFilter === 'sev4-alerts' ? 'ring-2 ring-sev4-alert/50' : ''
          }`}
          onClick={() => onCardFilter('sev4-alerts')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sev4-alert text-sm font-medium uppercase tracking-wide">
              Alertas SEV4
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-sev4-alert mb-2">
              {sev4Alerts}
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`bg-panel-bg/50 border-sev4-alert/10 cursor-pointer ${
            activeFilter === 'pending-sev4-alerts' ? 'ring-2 ring-sev4-alert/50' : ''
          }`}
          onClick={() => onCardFilter('pending-sev4-alerts')}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pendente Acionamento</span>
              <span className="text-lg font-semibold text-sev4-alert">
                {pendingSev4Alerts}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEV3 Incidents */}
      <div className="space-y-4">
        <Card 
          className={`bg-panel-bg border-sev3-incident/20 hover:border-sev3-incident/40 transition-colors cursor-pointer ${
            activeFilter === 'sev3-incidents' ? 'ring-2 ring-sev3-incident/50' : ''
          }`}
          onClick={() => onCardFilter('sev3-incidents')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sev3-incident text-sm font-medium uppercase tracking-wide">
              Incidentes SEV3
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-sev3-incident mb-2">
              {sev3Incidents}
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`bg-panel-bg/50 border-sev3-incident/10 cursor-pointer ${
            activeFilter === 'pending-sev3-incidents' ? 'ring-2 ring-sev3-incident/50' : ''
          }`}
          onClick={() => onCardFilter('pending-sev3-incidents')}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pendente Acionamento</span>
              <span className="text-lg font-semibold text-sev3-incident">
                {pendingSev3Incidents}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};