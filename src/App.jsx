import {
  useEffect,
  useState,
} from "react";

import "./App.css";

import { api } from "./services/api";

import Login from "./pages/Login/Login";

import Layout from "./components/Layout";

import StudentDashboard
  from "./pages/student/Dashboard";

import StudentInternship
  from "./pages/student/Internship";

import StudentReports
  from "./pages/student/Reports";

import StudentCalendar
  from "./pages/student/Calendar";

import StudentForms
  from "./pages/student/Forms";

import StudentNotifications
  from "./pages/student/Notifications";

import StudentEvaluation
  from "./pages/student/Evaluation";

import StudentProfile
  from "./pages/student/Profile";

import StudentChat
  from "./pages/student/Chat";  

import StudentDigitalTwin
  from "./pages/intelligence/student/DigitalTwin";

import StudentAnnouncements
  from "./pages/student/Announcements";

import StudentMentor
  from "./pages/intelligence/student/Mentor";

import StudentWhatIf
  from "./pages/intelligence/student/WhatIf";

import AdvisorDashboard
  from "./pages/advisor/Dashboard";

import AdvisorCommandCenter
  from "./pages/intelligence/advisor/CommandCenter";

import AdvisorAnomalies
  from "./pages/intelligence/advisor/Anomalies";

import AdvisorQACenter
  from "./pages/qa/QACenter";

import AdvisorReports
  from "./pages/advisor/Reports";

import AdvisorStudents
  from "./pages/advisor/Students";

import AdvisorEvaluations
  from "./pages/advisor/Evaluations";

import AdvisorAnnouncements
  from "./pages/advisor/Announcements";

import AdvisorForms
  from "./pages/advisor/Forms";  

import AdvisorCalendar
  from "./pages/advisor/Calendar";

import AdvisorNotifications
  from "./pages/advisor/Notifications";

import AdvisorProfile
  from "./pages/advisor/Profile";

import AdvisorChat
  from "./pages/advisor/Chat";

import "./theme.css";


function App() {

  const [user, setUser] =
  useState(() => {

    try {

      const saved =
        localStorage.getItem(
          "internship_user"
        );

      return saved
        ? JSON.parse(saved)
        : null;

    } catch {

      return null;

    }

  });

 const [page, setPage] =
  useState(() => {

    return (
      localStorage.getItem(
        "internship_page"
      ) ||
      "dashboard"
    );

  });

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  async function load(
    currentUser = user
  ) {

    if (!currentUser) return;

    setLoading(true);
    setError("");

    try {

      if (currentUser.role === "admin") {
        setData({});
        return;
      }

      const result =
        currentUser.role === "student"
          ? await api(
              `/dashboard/student/${
                currentUser.studentId ||
                currentUser.username
              }`
            )
          : await api(
              "/dashboard/advisor"
            );

      setData(result || {});

    } catch (err) {

      setError(
        err.message ||
        "ไม่สามารถโหลดข้อมูลได้"
      );

      setData({});

    } finally {

      setLoading(false);

    }
  }


  function handleLogin(
  loggedInUser
) {

  setUser(loggedInUser);

  localStorage.setItem(
    "internship_user",
    JSON.stringify(
      loggedInUser
    )
  );


  if (loggedInUser.role === "admin") {

    setPage("advisor-qa");

  } else if (
    loggedInUser.role ===
    "advisor"
  ) {

    setPage(
      "advisor-dashboard"
    );

  } else {

    setPage(
      "dashboard"
    );

  }

  setData(null);
  setError("");
}


  function navigate(
  nextPage
) {

  setPage(nextPage);

  localStorage.setItem(
    "internship_page",
    nextPage
  );
}


  function logout() {

    localStorage.removeItem(
      "internship_token"
    );

    localStorage.removeItem(
      "internship_user"
    );

    localStorage.removeItem(
      "internship_page"
    );

    setUser(null);
    setData(null);
    setPage("dashboard");
    setError("");
  }


  useEffect(() => {

    if (!user) return;

    load(user);

  }, [user]);


  if (!user) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }


  if (loading && !data) {

    return (
      <div className="loading-page">
        กำลังโหลดข้อมูลระบบ...
      </div>
    );
  }


  let view;


  /*
   * ============================
   * ADMIN (QA Center เท่านั้น)
   * ============================
   */

  if (user.role === "admin") {

    view = <AdvisorQACenter />;

  }


  /*
   * ============================
   * STUDENT
   * ============================
   */

  else if (user.role === "student") {

    switch (page) {

      case "dashboard":

        view = (
          <StudentDashboard
            data={data || {}}
            setPage={navigate}
          />
        );

        break;


      case "internship":

        view = (
          <StudentInternship
            student={
              data?.student || null
            }
            onSave={load}
          />
        );

        break;


      case "reports":

        view = (
          <StudentReports
            data={data || {}}
            refresh={load}
          />
        );

        break;


      case "calendar":

        view = (
          <StudentCalendar
            activities={
              data?.activities || []
            }
            refresh={load}
          />
        );

        break;
      
      case "chat":

  view = (
    <StudentChat
      user={user}
    />
  );

  break;  

      case "digital-twin":

        view = (
          <StudentDigitalTwin
            user={user}
          />
        );

        break;

      case "mentor":

        view = (
          <StudentMentor
            user={user}
          />
        );

        break;

      case "whatif":

        view = (
          <StudentWhatIf
            user={user}
          />
        );

        break;

      case "forms":

        view = (
          <StudentForms />
        );

        break;
      case "announcements":
        view = (
          <StudentAnnouncements
            announcements={
              data?.announcements || []
            }
          />
        );
        break;


            case "notifications":

        view = (
          <StudentNotifications
            notifications={
              data?.notifications || []
            }
            refresh={load}
            user={user}
          />
        );

        break;


      case "evaluation":

        view = (
          <StudentEvaluation
            evaluations={
              data?.evaluations || []
            }
          />
        );

        break;


      case "profile":

        view = (
          <StudentProfile
            user={user}
            student={
              data?.student || null
            }
            onSaved={load}
          />
        );

        break;


      default:

        view = (
          <StudentDashboard
            data={data || {}}
            setPage={navigate}
          />
        );
    }

  }


  /*
   * ============================
   * ADVISOR
   * ============================
   */

  else {

    switch (page) {

      case "advisor-command-center":

  view = (
    <AdvisorCommandCenter
      setPage={navigate}
    />
  );

  break;


      case "advisor-anomalies":

  view = (
    <AdvisorAnomalies />
  );

  break;


      case "advisor-students":

  view = (
    <AdvisorStudents
      data={data || {}}
    />
  );

  break;


case "advisor-announcements":

  view = (
    <AdvisorAnnouncements />
  );

  break;


case "advisor-evaluations":

  view = (
    <AdvisorEvaluations
      data={data || {}}
      refresh={load}
    />
  );

  break;


case "advisor-forms":

  view = (
    <AdvisorForms />
  );

  break;

      case "advisor-dashboard":

        view = (
          <AdvisorDashboard
            data={data || {}}
            setPage={navigate}
          />
        );

        break;


      case "advisor-reports":

        view = (
          <AdvisorReports
            data={data || {}}
            refresh={load}
          />
        );

        break;


      case "calendar":

        view = (
          <AdvisorCalendar
            data={data || {}}
            activities={data?.activities || []}
            refresh={load}
          />
        );

        break;
        
       case "chat":

        view = (
          <AdvisorChat />
        );

        break;
  


      case "notifications":

        view = (
          <AdvisorNotifications
            notifications={
              data?.notifications || []
            }
            refresh={load}
            user={user}
          />
        );

        break;


      case "profile":

        view = (
          <AdvisorProfile
            user={user}
            onSaved={load}
          />
        );

        break;


      default:

        view = (
          <AdvisorDashboard
            data={data || {}}
            setPage={navigate}
          />
        );
    }

  }


    return (
    <Layout
      user={user}
      page={page}
      setPage={navigate}
      onLogout={logout}
      notifications={
        data?.notifications || []
      }

      unreadMessages={
    data?.unreadMessages || 0
  }
      data={data || {}}
    >
      {view}
    </Layout>
  );

}
export default App;