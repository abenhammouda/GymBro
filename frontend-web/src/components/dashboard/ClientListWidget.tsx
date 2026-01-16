import React from 'react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './ClientListWidget.css';

interface Client {
    id: number;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
    currentWeight?: number;
    weightChange?: number;
    program?: string;
    status: 'Active' | 'Inactive' | 'Pending';
}

interface ClientListWidgetProps {
    clients: Client[];
    onViewAll?: () => void;
}

const ClientListWidget: React.FC<ClientListWidgetProps> = ({ clients, onViewAll }) => {
    const getWeightBadge = (change?: number) => {
        if (!change) return null;

        const isPositive = change > 0;
        return (
            <div className={`weight-change ${isPositive ? 'weight-change--up' : 'weight-change--down'}`}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{Math.abs(change).toFixed(1)} kg</span>
            </div>
        );
    };

    const getStatusVariant = (status: string): 'success' | 'neutral' | 'warning' => {
        switch (status) {
            case 'Active':
                return 'success';
            case 'Pending':
                return 'warning';
            default:
                return 'neutral';
        }
    };

    return (
        <Card padding="lg">
            <CardHeader>
                <div className="client-list-widget__header">
                    <h3 className="client-list-widget__title">Recent Clients</h3>
                    {onViewAll && (
                        <Button variant="ghost" size="sm" onClick={onViewAll}>
                            View All
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardBody>
                <div className="client-list-widget__list">
                    {clients.map((client) => (
                        <div key={client.id} className="client-list-widget__item">
                            <Avatar
                                src={client.profilePictureUrl}
                                name={`${client.firstName} ${client.lastName}`}
                                size="md"
                            />
                            <div className="client-list-widget__info">
                                <div className="client-list-widget__name">
                                    {client.firstName} {client.lastName}
                                </div>
                                {client.program && (
                                    <div className="client-list-widget__program">{client.program}</div>
                                )}
                            </div>
                            <div className="client-list-widget__metrics">
                                {client.currentWeight && (
                                    <div className="client-list-widget__weight">
                                        <Badge variant="success" size="sm">
                                            {client.currentWeight} kg
                                        </Badge>
                                    </div>
                                )}
                                {getWeightBadge(client.weightChange)}
                            </div>
                            <Badge variant={getStatusVariant(client.status)} size="sm">
                                {client.status}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
};

export default ClientListWidget;
