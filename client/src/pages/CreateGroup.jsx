import React from "react";
import { Toaster } from "react-hot-toast";

const CreateGroup = () => {
  return (
    <div>
      <Toaster />
      <div className="create-group">
        <form className="create-group-form">
          <label className="create-group-form-icon" htmlFor="icon">
            I am icon
          </label>
          <input type="file" id="icon" />
          <input type="text" />
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
