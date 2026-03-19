import { useAttendance, useTodayAttendanceDashboard } from '@/features/shifts/useAttendance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Square, Coffee, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface AttendanceDashboardProps {
  businessId: string;
  employmentId: string;
}

export const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ businessId, employmentId }) => {
  const { data: dashboard, isLoading: isLoadingDashboard } = useTodayAttendanceDashboard(businessId);
  const { 
    checkIn, 
    checkOut, 
    startBreak, 
    endBreak, 
    isCheckingIn, 
    isCheckingOut, 
    isStartingBreak, 
    isEndingBreak 
  } = useAttendance(businessId);

  const activeLog = dashboard?.attendance;
  const activeBreak = activeLog?.breaks?.find((b: any) => !b.endTime && !b.end);
  const todaysShifts = dashboard?.shifts || [];
  const nextShift = todaysShifts.find((s: any) => s.status === 'SCHEDULED');

  const getLocation = (): Promise<{ lat: number; lng: number } | undefined> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          resolve(undefined);
        },
        { timeout: 5000 }
      );
    });
  };

  const handleCheckIn = async () => {
    const location = await getLocation();
    await checkIn({ businessId, employmentId, shiftId: nextShift?.id, location });
  };

  const handleCheckOut = async () => {
    const location = await getLocation();
    await checkOut({ businessId, employmentId, location });
  };

  const handleStartBreak = async () => {
    await startBreak({ businessId, employmentId });
  };

  const handleEndBreak = async () => {
    await endBreak({ businessId, employmentId });
  };

  if (isLoadingDashboard) {
    return (
      <Card className="w-full">
        <CardContent className="py-10 flex flex-col items-center justify-center gap-4">
          <Clock className="h-8 w-8 text-muted-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">Checking attendance status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-primary/20 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Time Tracking</CardTitle>
              <CardDescription>Manage your daily attendance</CardDescription>
            </div>
          </div>
          {activeLog?.status === 'PRESENT' || activeLog?.status === 'ON_BREAK' ? (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 animate-pulse text-white border-none px-3 py-1">
              Currently Clocked In
            </Badge>
          ) : activeLog?.status === 'LATE' ? (
            <Badge variant="destructive" className="px-3 py-1">Late</Badge>
          ) : (
            <Badge variant="secondary" className="px-3 py-1">Offline</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {!activeLog ? (
            todaysShifts.length > 0 ? (
              <Button 
                onClick={handleCheckIn} 
                disabled={isCheckingIn}
                size="lg"
                className="w-full h-14 text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {isCheckingIn ? <Clock className="h-5 w-5 animate-spin mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                Clock In Now
              </Button>
            ) : (
                <div className="md:col-span-2 p-4 border border-dashed rounded-lg bg-muted/50 flex flex-col items-center justify-center gap-2 text-center">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No shifts scheduled for today. You don't need to clock in.</p>
                </div>
            )
          ) : (
            <>
              <Button 
                onClick={handleCheckOut} 
                disabled={isCheckingOut}
                variant="destructive"
                size="lg"
                className="w-full h-14 text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {isCheckingOut ? <Clock className="h-5 w-5 animate-spin mr-2" /> : <Square className="h-5 w-5 mr-2" />}
                Clock Out
              </Button>

              {!activeBreak ? (
                <Button 
                  onClick={handleStartBreak} 
                  disabled={isStartingBreak || isCheckingOut}
                  variant="outline"
                  size="lg"
                  className="w-full h-14 text-base font-semibold border-2"
                >
                  {isStartingBreak ? <Clock className="h-5 w-5 animate-spin mr-2" /> : <Coffee className="h-5 w-5 mr-2 text-orange-500" />}
                  Take a Break
                </Button>
              ) : (
                <Button 
                  onClick={handleEndBreak} 
                  disabled={isEndingBreak || isCheckingOut}
                  variant="outline"
                  size="lg"
                  className="w-full h-14 text-base font-semibold border-2 border-primary/20 bg-primary/5"
                >
                  {isEndingBreak ? <Clock className="h-5 w-5 animate-spin mr-2" /> : <Play className="h-5 w-5 mr-2 text-primary" />}
                  Back to Work
                </Button>
              )}
            </>
          )}
        </div>

        {activeLog && (
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Checked in at {format(parseISO(activeLog.checkInTime), 'HH:mm')}</span>
            </div>
            {activeBreak && (
              <div className="flex items-center gap-2 text-sm text-orange-500 font-medium">
                <Coffee className="h-4 w-4" />
                <span>On break since {format(parseISO(activeBreak.start || activeBreak.startTime), 'HH:mm')}</span>
              </div>
            )}
            {nextShift && !activeLog.checkOutTime && (
              <div className="flex items-center gap-2 text-sm text-blue-500">
                <AlertCircle className="h-4 w-4" />
                <span>Working Shift: {format(parseISO(nextShift.startTime), 'HH:mm')} - {format(parseISO(nextShift.endTime), 'HH:mm')}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
