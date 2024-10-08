import React from "react";

const Contact = () => {
  return (
    <div className="text-center my-40 font-bold">
      <div className="flex flex-row justify-between">
        <label>Name</label>
        <input placeholder="Write your name" />
        <label>Message</label>
        <input placeholder="Write your message" />
        <button>Submit</button>
      </div>
    </div>
  );
};

export default Contact;
