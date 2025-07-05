const Dashboard = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="">Streaks Here</div>
      <div className="flex gap-3">
        <div className="flex-1 ">
          <span>Tasks here</span>
        </div>
        <div className="flex-1 ">
          <span>Reminders here</span>
        </div>
      </div>
      <div className="">chat history here</div>
    </div>
  );
};

export default Dashboard;
