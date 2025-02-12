import React, { useState, useEffect } from "react";
import TextInput from "@/components/TextInput";
import PrimaryButton from "@/components/PrimaryButton";
import InputLabel from "@/components/InputLabel";
import { usePage } from '@inertiajs/react';

const CreateJam = () => {
  const { auth } = usePage().props;
  const [numQuestions, setNumQuestions] = useState(5);
  const [timeLimit, setTimeLimit] = useState(30);
  const [category, setCategory] = useState("math");
  const [showScores, setShowScores] = useState(true);
  const [existingJam, setExistingJam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExistingJam = async () => {
      const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute("content");
      if (!baseUrl) {
        console.error("Base URL not found.");
        return;
      }

      const apiUrl = `${baseUrl}/math-jams/check-existing?teacher_id=${auth.user.id}`;

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (response.ok && data.jam) {
          setExistingJam(data.jam);
        } else {
          setExistingJam(null);
        }
      } catch (error) {
        console.error("Error fetching existing jam:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingJam();
  }, [auth.user.id]);

  // useEffect(() => {
  //   const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute("content");
  //   const sseUrl = `${baseUrl}/math-jams/stream-updates?teacher_id=${auth.user.id}`;

  //   let eventSource;

  //   const connectSSE = () => {
  //     eventSource = new EventSource(sseUrl);

  //     eventSource.onmessage = (event) => {
  //       const data = JSON.parse(event.data);

  //       if (data && (data.status === "waiting" || data.status === "started")) {
  //         setExistingJam(data);
  //       } else {
  //         setExistingJam(null);
  //       }
  //     };

  //     eventSource.onerror = (error) => {
  //       // console.error("SSE Error:", error);
  //       eventSource.close();
  //       setTimeout(() => {
  //         // console.log("Reconnecting SSE...");
  //         connectSSE();
  //       }, 1000);
  //     };
  //   };

  //   connectSSE();

  //   return () => {
  //     eventSource?.close();
  //   };
  // }, [auth.user.id]);

  const handleCreateJam = async () => {
    if (existingJam) {
      alert("You already have an ongoing Math Jam. Please finish it before creating a new one.");
      return;
    }

    const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute("content");
    if (!baseUrl) {
      console.error("Base URL not found.");
      alert("Base URL not found.");
      return;
    }

    const apiUrl = `${baseUrl}/math-jams/create`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
        body: JSON.stringify({
          teacher_id: auth.user.id,
          num_questions: parseInt(numQuestions, 10),
          time_limit: parseInt(timeLimit, 10),
          category,
          show_scores: showScores ? 1 : 0,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Math Jam created successfully!");
        setExistingJam(data.jam);
      } else {
        alert(data.message || "Failed to create Math Jam.");
        console.error("Error details:", data);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("An error occurred while creating the jam.");
    }
  };

  const handleCancelJam = async () => {
    const confirmed = window.confirm("Are you sure you want to cancel this Math Jam?");
    if (confirmed) {
      const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute("content");
      if (!baseUrl) {
        console.error("Base URL not found.");
        alert("Base URL not found.");
        return;
      }

      const apiUrl = `${baseUrl}/math-jams/cancel`;

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
          },
          body: JSON.stringify({
            jam_id: existingJam.id,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          alert("Math Jam cancelled successfully.");
          setExistingJam(null);
        } else {
          alert(data.message || "Failed to cancel the Math Jam.");
          console.error("Error details:", data);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        alert("An error occurred while cancelling the jam.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-[400px]">
        <h2 className="text-xl font-semibold text-center mb-4">
          {existingJam ? "Ongoing Math Jam" : "Create a Live Jam"}
        </h2>

        {loading ? (
          <p className="text-center">Checking for existing jams...</p>
        ) : existingJam ? (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded">
            <p><strong>Code:</strong> {existingJam.math_jam_code}</p>
            <p><strong>Questions:</strong> {existingJam.num_questions}</p>
            <p><strong>Time Limit:</strong> {existingJam.time_limit} sec</p>
            <p><strong>Category:</strong> {existingJam.category}</p>
            <p><strong>Status:</strong> {existingJam.status}</p>
            <PrimaryButton onClick={handleCancelJam} className="w-full mt-4 bg-red-500 hover:bg-red-600">
              Cancel Jam
            </PrimaryButton>
          </div>
        ) : (
          <>
            {/* Number of Questions */}
            <div className="mb-3">
              <InputLabel value="Number of Questions" />
              <TextInput
                type="number"
                className="w-full"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
              />
            </div>

            {/* Time Limit */}
            <div className="mb-3">
              <InputLabel value="Time Limit per Question (sec)" />
              <TextInput
                type="number"
                className="w-full"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
              />
            </div>

            {/* Category Selection */}
            <div className="mb-3">
              <InputLabel value="Question Category" />
              <select
                className="w-full border p-2 rounded"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="math">Math</option>
                <option value="science">Science</option>
                <option value="history">History</option>
              </select>
            </div>

            {/* Show Scores Checkbox */}
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                checked={showScores}
                onChange={() => setShowScores(!showScores)}
              />
              <span>Show Scores to Students</span>
            </div>

            {/* Create Jam Button */}
            <PrimaryButton onClick={handleCreateJam} className="w-full">
              Create Jam
            </PrimaryButton>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateJam;
