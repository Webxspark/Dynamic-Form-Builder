import { Button, message } from "antd";
import {
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../contexts/global-context";
import { LoaderCircle, User } from "lucide-react";
import { API_ENDPOINT } from "../constants";

const FormPage = () => {
  const { user, api } = useContext(GlobalContext);
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<FormResponse["form"]>(
    {} as FormResponse["form"]
  );
  const [userFilledData, setUserFilledData] = useState<{
    [key: string]: string;
  }>({});
  const isMounted = useRef(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const middleware = useCallback(() => {
    let roll_number = user?.roll_number;

    if (!roll_number) {
      navigate("/");
      message.info("Please login to continue!");
      return;
    }

    setLoading(true);

    fetch(`${API_ENDPOINT}/get-form?rollNumber=${roll_number}`)
      .then((r) => r.json())
      .then((resp) => {
        const response = resp as FormResponse;
        message.success(response.message);
        setFormData(response.form);
      })
      .catch((err) => {
        console.error(err);
        message.info(err.message || "Something went wrong! Check the console.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      middleware();
    }
  }, [middleware]);

  const handleChange = (fieldId: string, value: string) => {
    setUserFilledData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const validateSection = (section: FormSection): boolean => {
    let isValid = true;
    for (const field of section.fields) {
      const value = userFilledData[field.fieldId] || "";
      if (field.required && !value.trim()) {
        message.error(`"${field.label}" is required.`);
        isValid = false;
      }
      if (field.minLength && value.length < field.minLength) {
        message.error(
          `"${field.label}" must be at least ${field.minLength} characters.`
        );
        isValid = false;
      }
      if (field.maxLength && value.length > field.maxLength) {
        message.error(
          `"${field.label}" must be at most ${field.maxLength} characters.`
        );
        isValid = false;
      }
    }
    return isValid;
  };

  const handleNext = () => {
    const section = formData.sections[currentSection];
    if (!validateSection(section)) return;
    setCurrentSection((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentSection((prev) => prev - 1);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const section = formData.sections[currentSection];
    if (!validateSection(section)) return;

    console.log("Collected Form Data:", userFilledData);
    message.success("Form submitted! (Check console)");
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.fieldId,
      name: field.fieldId,
      placeholder: field.placeholder,
      value: userFilledData[field.fieldId] || "",
      onChange: (e: any) => handleChange(field.fieldId, e.target.value),
      className: "border rounded px-2 py-1 w-full",
    };

    switch (field.type) {
      case "text":
      case "email":
      case "tel":
      case "date":
        return (
          <input
            data-testid={field.dataTestId}
            type={field.type}
            {...commonProps}
          />
        );
      case "textarea":
        return (
          <textarea data-testid={field.dataTestId} rows={3} {...commonProps} />
        );
      case "dropdown":
        return (
          <select data-testid={field.dataTestId} {...commonProps}>
            <option value="">Select</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "radio":
        return (
          <div className="flex flex-col gap-1">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.fieldId}
                  value={opt.value}
                  data-testid={field.dataTestId}
                  checked={userFilledData[field.fieldId] === opt.value}
                  onChange={() => handleChange(field.fieldId, opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="flex flex-col gap-1">
            {field.options?.map((opt) => {
              const selected = userFilledData[field.fieldId]?.split(",") || [];
              const isChecked = selected.includes(opt.value);
              return (
                <label key={opt.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={opt.value}
                    data-testid={field.dataTestId}
                    checked={isChecked}
                    onChange={() => {
                      const updated = isChecked
                        ? selected.filter((v) => v !== opt.value)
                        : [...selected, opt.value];
                      handleChange(field.fieldId, updated.join(","));
                    }}
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        );
      default:
        return null;
    }
  };

  const section = formData.sections?.[currentSection];

  const handleLogout = () => {
    if (window.confirm("Are you sure?")) {
      api.setUser(null, null);
    }
  };

  useEffect(() => {
    if (!user.name && !user.roll_number) {
      navigate("/");
    }
  }, [user]);

  return (
    <div className="h-screen bg-gray-100 overflow-y-auto">
      <div className="px-2 w-full py-12 flex items-center justify-center">
        <div className="p-4 bg-white rounded-lg max-w-3xl w-full shadow-lg border">
          {loading ? (
            <div className="flex items-center justify-center w-full">
              <LoaderCircle className="animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between mb-2">
                <p className="flex items-center gap-1 text-sm">
                  <User className="size-4" /> {user?.name || "User"} (
                  {user?.roll_number || "Reg No"})
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-gray-100 rounded-lg p-2 py-0 hover:bg-gray-200 duration-200"
                >
                  Logout
                </button>
              </div>
              <hr className="my-2" />
              <h1 className="text-lg font-semibold">
                {formData.formTitle}{" "}
                <span className="font-normal text-sm">
                  ({formData.version})
                </span>
              </h1>

              {section && (
                <div className="mt-4">
                  <h2 className="text-md font-semibold">{section.title}</h2>
                  <p className="text-sm text-gray-500">{section.description}</p>
                  <div className="mt-4 space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.fieldId}>
                        <label
                          htmlFor={field.fieldId}
                          className="block font-medium mb-1"
                        >
                          {field.label}
                          {field.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex gap-2 justify-end mt-6">
                {currentSection > 0 && (
                  <Button onClick={handlePrev}>Previous</Button>
                )}
                {currentSection === formData.sections?.length - 1 ? (
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                ) : (
                  <Button type="primary" onClick={handleNext}>
                    Next
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormPage;
