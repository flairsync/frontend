import React, { useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { useMyBusiness } from "@/features/business/useMyBusiness";
import { ReservationDashboard } from "@/components/management/reservations/ReservationDashboard";
import { BookingFlowModal } from "@/components/management/reservations/BookingFlowModal";
import { EditReservationModal } from "@/components/management/reservations/EditReservationModal";
import { ViewReservationModal } from "@/components/management/reservations/ViewReservationModal";

const ReservationsPage: React.FC = () => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { myBusinessFullDetails } = useMyBusiness(businessId);
    const businessTimezone = myBusinessFullDetails?.timezone;

    const [createOpen, setCreateOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<any>(null);
    const [viewingReservation, setViewingReservation] = useState<any>(null);

    return (
        <div className="p-6">
            <ReservationDashboard
                businessId={businessId}
                timezone={businessTimezone}
                onViewReservation={(r) => setViewingReservation(r)}
                onEditReservation={(r) => setEditingReservation(r)}
                onCreateReservation={() => setCreateOpen(true)}
            />

            <BookingFlowModal businessId={businessId} open={createOpen} onOpenChange={setCreateOpen} />

            <EditReservationModal
                businessId={businessId}
                reservation={editingReservation}
                open={!!editingReservation}
                onOpenChange={(v) => { if (!v) setEditingReservation(null); }}
            />

            <ViewReservationModal
                businessId={businessId}
                reservation={viewingReservation}
                open={!!viewingReservation}
                onOpenChange={(v) => { if (!v) setViewingReservation(null); }}
                onActionComplete={() => setViewingReservation(null)}
            />
        </div>
    );
};

export default ReservationsPage;
