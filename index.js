import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

// CountdownTimer Component
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

  const completeTask = (increment = 1) => {
    if (phase === "curation") {
      setCurationTasks((prev) => Math.min(prev + increment, totalCurationTasks));
    } else if (phase === "application") {
      setApplicationTasks((prev) => Math.min(prev + increment, totalApplicationTasks));
    }
  };

  return (
    <div className="App" style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {showNudge && phase === "application" && (
        <div style={{ color: "red", fontWeight: "bold" }}>
          Time to complete this application!
        </div>
      )}

      <h1>{phase === "curation" ? "Curation Phase" : "Application Phase"}</h1>
      <h2 style={{ fontSize: "48px" }}>{formatTime(timeLeft)}</h2>
      <div>
        <button onClick={handleStart} style={{ marginRight: "10px" }}>
          Start
        </button>
        <button onClick={handlePause} style={{ marginRight: "10px" }}>
          Pause
        </button>
        <button onClick={handleReset} style={{ marginRight: "10px" }}>
          Reset
        </button>
      </div>
      <p>
        {phase === "curation"
          ? `${curationTasks} of ${totalCurationTasks} curated`
          : `${applicationTasks} of ${totalApplicationTasks} applied`}
      </p>
      <button onClick={() => completeTask(1)} style={{ marginTop: "10px" }}>
        +1 Task
      </button>
    </div>
  );
};

// Render the app
ReactDOM.render(
  <React.StrictMode>
    <CountdownTimer />
  </React.StrictMode>,
  document.getElementById("root")
);
