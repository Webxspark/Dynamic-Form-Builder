import { Button, Input, message } from "antd";
import { FormEvent, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINT } from "../constants";
import { GlobalContext } from "../contexts/global-context";
const Login = () => {
  const [rollNum, setRollNum] = useState(""),
    [username, setUserName] = useState("");
  const { user, api } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user.name && user.roll_number) {
      navigate("/form");
    }
  }, [user]);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (rollNum == "" || username == "") {
      message.info("Please fill all the fields to continue!");
      return;
    }
    setLoading(true);
    fetch(`${API_ENDPOINT}/create-user`, {
      method: "POST",
      body: JSON.stringify({
        rollNumber: rollNum,
        name: username,
      }),
      headers: {
        "content-type": "application/json",
      },
    })
      .then((r) => {
        if (r.status === 409) {
          // user already exists
          api.setUser(rollNum, username);
          throw Error(
            "User exists! Trying to login with the existing information."
          );
        }
        return r.json();
      })
      .then((resp) => {
        const response = resp as { message: string };
        console.log(response);
        api.setUser(rollNum, username);
        message.success(`Welcome ${user.name || "User"}! You're logged in :)`);
      })
      .catch((err) => {
        console.error(err);
        message.info(
          err.message || "Something went wrong! Check the console for errors."
        );
      })
      .finally(() => setLoading(false));
  };
  return (
    <div className="h-screen bg-gray-100">
      <div className="px-2 w-full h-full flex items-center justify-center">
        <div className="p-4 bg-white rounded-lg max-w-xl w-full shadow-lg border">
          <h1 className="text-lg font-semibold">Login</h1>

          <form onSubmit={handleFormSubmit} className="grid gap-1 mt-3">
            <div className="grid gap-1">
              <label htmlFor="rollNum">Roll Number</label>
              <Input
                id="rollNum"
                className="w-full"
                placeholder="Ex: RA2211003020264"
                value={rollNum}
                onChange={(e) => setRollNum(e.target.value)}
              />
            </div>
            <div className="grid gap-1">
              <label htmlFor="name">Name</label>
              <Input
                id="name"
                className="w-full"
                placeholder="Ex: Allan Christofer"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="flex justify-end mt-3">
              <Button disabled={loading} type="primary" htmlType="submit">
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
