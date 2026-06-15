import React from 'react';
import { useAttendance, useTodayAttendanceDashboard } from '@/features/shifts/useAttendance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Square, Coffee, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useBusinessBasicDetails } from '@/features/business/useBusinessBasicDetails';
import { formatInBusinessTimezone } from '@/utils/date-utils';
import { toast } from 'sonner';

interface AttendanceDashboardProps {
  businessId: string;
  employmentId: string;
}

export const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ businessId, employmentId }) => {
  const { data: dashboard, isLoading: isLoadingDashboard } = useTodayAttendanceDashboard(businessId);
  const { businessBasicDetails } = useBusinessBasicDetails(businessId);
  const businessTz = businessBasicDetails?.timezone || 'UTC';

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

  const [isLocalCheckingIn, setIsLocalCheckingIn] = React.useState(false);
  const [isLocalCheckingOut, setIsLocalCheckingOut] = React.useState(false);
  const [isLocalStartingBreak, setIsLocalStartingBreak] = React.useState(false);
  const [isLocalEndingBreak, setIsLocalEndingBreak] = React.useState(false);

  const activeLog = dashboard?.attendance;
  const activeBreak = activeLog?.breaks?.find((b: any) => !b.endTime && !b.end);
  const todaysShifts = dashboard?.shifts || [];
  const nextShift = todaysShifts.find((s: any) => s.status === 'SCHEDULED');

  const getLocation = async (): Promise<{ lat: number; lng: number } | undefined> => {
    if (!businessBasicDetails?.requireGpsForAttendance) {
      return undefined;
    }
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          toast.error("Location permission denied. Please allow location access to clock in.");
          reject(error);
        },
        { timeout: 5000 }
      );
    });
  };

  const handleCheckIn = async () => {
    setIsLocalCheckingIn(true);
    try {
      const location = await getLocation();
      await checkIn({ businessId, employmentId, shiftId: nextShift?.id, location });
    } catch (e) {
      // Error handled in getLocation or checkIn mutation
    } finally {
      setIsLocalCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLocalCheckingOut(true);
    try {
      const location = await getLocation();
      await checkOut({ businessId, employmentId, location });
    } catch (e) {
      // Error handled in getLocation or checkOut mutation
    } finally {
      setIsLocalCheckingOut(false);
    }
  };

  const handleStartBreak = async (type: 'PAID' | 'UNPAID') => {
    setIsLocalStartingBreak(true);
    try {
      await startBreak({ businessId, employmentId, type });
    } finally {
      setIsLocalStartingBreak(false);
    }
  };

  const handleEndBreak = async () => {
    setIsLocalEndingBreak(true);
    try {
      await endBreak({ businessId, employmentId });
    } finally {
      setIsLocalEndingBreak(false);
    }
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
          {activeLog?.checkOutTime ? (
            activeLog.isValidated ? (
              <Badge variant="outline" className="border-green-500 bg-green-50 text-green-700 px-3 py-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Validated
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 px-3 py-1 flex items-center gap-1">
                Finished
              </Badge>
            )
          ) : activeLog?.status === 'PRESENT' || activeLog?.status === 'ON_BREAK' ? (
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
              nextShift?.staffResponse === 'ACCEPTED' ? (
              <Button 
                  onClick={handleCheckIn} 
                  disabled={isCheckingIn || isLocalCheckingIn}
                  size="lg"
                  className="w-full h-14 text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isCheckingIn || isLocalCheckingIn ? <Clock className="h-5 w-5 animate-spin mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                  Clock In Now
                </Button>
              ) : (
                <div className="md:col-span-2 p-4 border border-amber-200 border-dashed rounded-lg bg-amber-50 flex flex-col items-center justify-center gap-2 text-center">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <p className="text-sm font-medium text-amber-800">You must accept your shift in the 'Today's Shift' section before you can clock in.</p>
                </div>
              )
            ) : (
                <div className="md:col-span-2 p-4 border border-dashed rounded-lg bg-muted/50 flex flex-col items-center justify-center gap-2 text-center">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No shifts scheduled for today. You don't need to clock in.</p>
                </div>
            )
          ) : (
            <div className="md:col-span-2">
              {!activeLog.checkOutTime ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={handleCheckOut} 
                    disabled={isCheckingOut || isLocalCheckingOut}
                    variant="destructive"
                    size="lg"
                    className="w-full h-14 text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {isCheckingOut || isLocalCheckingOut ? <Clock className="h-5 w-5 animate-spin mr-2" /> : <Square className="h-5 w-5 mr-2" />}
                    Clock Out
                  </Button>

                  {!activeBreak ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          disabled={isStartingBreak || isLocalStartingBreak || isCheckingOut || isLocalCheckingOut}
                          variant="outline"
                          size="lg"
                          className="w-full h-14 text-base font-semibold border-2"
                        >
                          {isStartingBreak || isLocalStartingBreak ? <Clock className="h-5 w-5 animate-spin mr-2" /> : <Coffee className="h-5 w-5 mr-2 text-orange-500" />}
                          Take a Break
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuItem onClick={() => handleStartBreak('PAID')}>
                          Take Paid Rest Break
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartBreak('UNPAID')}>
                          Take Unpaid Meal Break
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button 
                      onClick={handleEndBreak} 
                      disabled={isEndingBreak || isLocalEndingBreak || isCheckingOut || isLocalCheckingOut}
                      variant="outline"
                      size="lg"
                      className="w-full h-14 text-base font-semibold border-2 border-primary/20 bg-primary/5"
                    >
                      {isEndingBreak || isLocalEndingBreak ? <Clock className="h-5 w-5 animate-spin mr-2" /> : <Play className="h-5 w-5 mr-2 text-primary" />}
                      Back to Work
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-6 border border-emerald-100 rounded-lg bg-emerald-50/30 flex flex-col items-center justify-center gap-3 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="p-3 bg-emerald-100 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="font-bold text-emerald-800 text-lg">Well Done!</p>
                        <p className="text-sm text-emerald-600">Your shift for today has been recorded.</p>
                        <div className="mt-4 p-3 bg-white/50 rounded-md border border-emerald-100 shadow-sm">
                           <p className="text-xs text-emerald-700 font-medium">
                              <span className="font-bold">Need to fix your times?</span> Contact your supervisor or an administrator to correct this record.
                           </p>
                        </div>
                    </div>
                </div>
              )}
            </div>
          )}
        </div>

        {activeLog && (
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Checked in at {formatInBusinessTimezone(activeLog.checkInTime, businessTz)}</span>
            </div>
            {activeLog.checkOutTime && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span>Checked out at {formatInBusinessTimezone(activeLog.checkOutTime, businessTz)}</span>
              </div>
            )}
            {activeBreak && (
              <div className="flex items-center gap-2 text-sm text-orange-500 font-medium">
                <Coffee className="h-4 w-4" />
                <span>On break since {formatInBusinessTimezone(activeBreak.start || activeBreak.startTime, businessTz)}</span>
              </div>
            )}
            {nextShift && !activeLog.checkOutTime && (
              <div className="flex items-center gap-2 text-sm text-blue-500">
                <AlertCircle className="h-4 w-4" />
                <span>Working Shift: {formatInBusinessTimezone(nextShift.startTime, businessTz)} - {formatInBusinessTimezone(nextShift.endTime, businessTz)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
