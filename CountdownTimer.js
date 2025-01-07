import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RefreshCcw, Plus, SkipForward } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CountdownTimer = () => {
  const [phase, setPhase] = useState("curation");
  const CURATION_TIME = 15 * 60; // 15 minutes
  const APPLICATION_TIME = 60 * 60; // 1 hour
  const APPLICATION_INTERVAL = 144; // 2 minutes 24 seconds
  const NUDGE_TIME = 72; // 1 minute 12 seconds

  const [timeLeft, setTimeLeft] = useState(CURATION_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [curationTasks, setCurationTasks] = useState(0);
  const [applicationTasks, setApplicationTasks] = useState(0);
  const [showNudge, setShowNudge] = useState(false);
  const [lastNudgeTime, setLastNudgeTime] = useState(null);

  const totalCurationTasks = 25;
  const totalApplicationTasks = 25;

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    let timer;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);

        if (phase === "application" && isRunning) {
          const timeElapsed = APPLICATION_TIME - timeLeft;

          if (
            timeElapsed % APPLICATION_INTERVAL === NUDGE_TIME &&
            lastNudgeTime !== timeElapsed
          ) {
            setShowNudge(true);
            setLastNudgeTime(timeElapsed);

            setTimeout(() => setShowNudge(false), 3000);
          }
        }
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (phase === "curation") {
        setPhase("application");
        setTimeLeft(APPLICATION_TIME);
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, phase, lastNudgeTime]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setPhase("curation");
    setTimeLeft(CURATION_TIME);
    setCurationTasks(0);
    setApplicationTasks(0);
    setShowNudge(false);
    setLastNudgeTime(null);
  };

  const handleSkipToApply = () => {
    setIsRunning(false);
    setPhase("application");
    setTimeLeft(APPLICATION_TIME);
    setShowNudge(false);
    setLastNudgeTime(null);
  };

  const completeTask = (increment = 1) => {
    if (phase === "curation") {
      setCurationTasks((prev) =>
        Math.min(prev + increment, totalCurationTasks)
      );
    } else if (phase === "application") {
      setApplicationTasks((prev) =>
        Math.min(prev + increment, totalApplicationTasks)
      );
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {showNudge && phase === "application" && (
        <Alert className="mb-4">
          <AlertDescription>
            Time to complete this application! Aim to finish in the next 1
            minute 12 seconds.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{phase === "curation" ? "Curation Phase" : "Application Phase"}</span>
            {phase === "curation" && (
              <Button variant="outline" size="sm" onClick={handleSkipToApply}>
                <SkipForward className="w-4 h-4 mr-2" />
                Skip to Apply
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-6xl font-bold text-center font-mono">
            {formatTime(timeLeft)}
          </div>
          <div className="flex justify-center space-x-2">
            {!isRunning ? (
              <Button onClick={handleStart}>
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button onClick={handlePause}>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            <Button variant="outline" onClick={handleReset}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {phase === "curation" ? "Curation Progress" : "Application Progress"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress
            value={
              phase === "curation"
                ? (curationTasks / totalCurationTasks) * 100
                : (applicationTasks / totalApplicationTasks) * 100
            }
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {phase === "curation"
                ? `${curationTasks} of ${totalCurationTasks} jobs curated`
                : `${applicationTasks} of ${totalApplicationTasks} jobs applied`}
            </span>
            <Button
              size="sm"
              onClick={() => completeTask(1)}
              disabled={
                phase === "curation"
                  ? curationTasks >= totalCurationTasks
                  : applicationTasks >= totalApplicationTasks
              }
            >
              +1
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CountdownTimer;
