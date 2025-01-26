import React, { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";

interface FormData {
  fullName: string;
  age: string;
  sex: string;
}

interface FormProps {
  onFormSubmit: () => void;
}

const Form: React.FC<FormProps> = ({ onFormSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    age: "",
    sex: "",
  });

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    onFormSubmit();
  };

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  // Validation function to check if all fields are filled correctly
  const isFormValid = () => {
    return (
      formData.fullName.trim() !== "" &&
      formData.age.trim() !== "" &&
      formData.sex.trim() !== ""
    );
  };

  return (
    <div className="w-full max-w-[90%] sm:max-w-lg md:max-w-xl flex flex-col gap-4 md:gap-6 bg-[#F0F0F0] text-black p-4 sm:p-6 md:p-8 font-extrabold shadow-[2px_2px_0_0_black] md:shadow-[4px_4px_0_0_black] border-2 border-black rounded-lg md:rounded-xl">
      <div>
        <div className="text-xl sm:text-2xl font-bold">App Name and logo</div>
        <div className="h-1 w-full bg-black mt-2 rounded-full"></div>
      </div>
      <Input
        label="Full Name"
        placeholder="John Doe"
        value={formData.fullName}
        required={true}
        onChange={(value) => setFormData({ ...formData, fullName: value })}
      />

      <Input
        type="number"
        label="Age"
        min={1}
        max={99}
        required={true}
        placeholder="25"
        value={formData.age}
        onChange={(value) => setFormData({ ...formData, age: value })}
      />

      <Select
        label="Sex"
        required={true}
        options={genderOptions}
        value={formData.sex}
        onChange={(value) => setFormData({ ...formData, sex: value })}
      />

      <Button onClick={handleSubmit} disabled={!isFormValid()}>
        Let's Go
      </Button>
    </div>
  );
};

export default Form;
