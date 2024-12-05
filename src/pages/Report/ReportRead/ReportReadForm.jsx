import React, { useEffect, useState } from "react";
import Layout from "../../../layout/Layout";
import axios from "axios";
import BASE_URL from "../../../base/BaseUrl";
import toast from "react-hot-toast";
import { Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import SelectInput from "../../../components/common/SelectInput";

const ReportReadForm = () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const [campagin, setCampagin] = useState({
    from_date: formatDate(startOfMonth),
    to_date: formatDate(today),
    campaign_template_id: "",
  });

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const navigate = useNavigate();
  const [template, setTemplate] = useState([]);

  const onInputChange = (name, value) => {
    setCampagin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    setIsButtonDisabled(true);

    const data = {
      from_date: campagin.from_date,
      to_date: campagin.to_date,
      campaign_template_id: campagin.campaign_template_id,
    };
    try {
      const response = await axios.post(
        `${BASE_URL}/panel-fetch-read-report`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (
        response.data &&
        response.data.campaign &&
        response.data.campaign.length > 0
      ) {
        localStorage.setItem("ReadData1", campagin.from_date);
        localStorage.setItem("ReadData2", campagin.to_date);
        localStorage.setItem("ReadData3", campagin.campaign_template_id);
        navigate("/report/view", {
          state: { ReadData: response.data.campaign },
        });
      } else {
        toast.error("No campaign data available or empty .");
      }
    } catch (error) {
      toast.error("Error adding campaign!");
      console.error(error);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const FormLabel = ({ children, required }) => (
    <label className="block text-sm font-semibold text-black mb-1">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  const inputClass =
    "w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 border-green-500";

  const getTemplate = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/panel-fetch-template`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setTemplate(res.data.template || []);
    } catch (error) {
      console.error("Failed to fetch template:", error);
    }
  };

  useEffect(() => {
    getTemplate();
  }, []);

  const handleExport = async () => {
    const data = {
      from_date: campagin.from_date,
      to_date: campagin.to_date,
      campaign_template_id: campagin.campaign_template_id,
    };
    try {
      const token = localStorage.getItem("token");
      const response = await axios({
        url: `${BASE_URL}/panel-download-read-report`,
        method: "POST",
        data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "read_list.csv");
      document.body.appendChild(link);
      link.click();

      toast.success("Contact list exported successfully!");
    } catch (error) {
      toast.error("Failed to export contact list.");
      console.error("Export error:", error);
    }
  };

  return (
    <Layout>
      <div className="bg-[#FFFFFF] p-4 rounded-lg">
        <div className="sticky top-0 p-2 mb-4 border-b-2 border-green-500 rounded-lg bg-[#E1F5FA]">
          <h2 className="px-5 text-black text-lg flex items-center gap-2">
            Read
          </h2>
        </div>
        <form
          autoComplete="off"
          onSubmit={onSubmit}
          className="w-full max-w-7xl mx-auto p-6 space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <SelectInput
                label="Template"
                options={template.map((item) => ({
                  value: item.id,
                  label: item.template_name,
                }))}
                value={campagin.campaign_template_id || ""}
                name="campaign_template_id"
                onChange={(e) => onInputChange(e.target.name, e.target.value)}
              />
            </div>
            <div>
              <FormLabel required>From Date</FormLabel>
              <input
                type="date"
                name="from_date"
                value={campagin.from_date}
                onChange={(e) => onInputChange(e.target.name, e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <FormLabel required>To Date</FormLabel>
              <input
                type="date"
                name="to_date"
                value={campagin.to_date}
                onChange={(e) => onInputChange(e.target.name, e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-center items-center gap-4">
            <Button
              className="w-36 text-white bg-blue-600"
              type="submit"
              disabled={isButtonDisabled}
            >
              {isButtonDisabled ? "View..." : "View"}
            </Button>
            <Button
              type="button"
              className="w-36 text-white bg-blue-600"
              onClick={handleExport}
            >
              Download
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ReportReadForm;
