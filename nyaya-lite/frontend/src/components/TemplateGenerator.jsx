import React, { useState } from 'react';
import { FileText, Download, Check } from 'lucide-react';
import jsPDF from 'jspdf';
import { useTranslation } from 'react-i18next';

export default function TemplateGenerator() {
    const { t } = useTranslation();
    const TEMPLATES = {
        FIR: {
            title: t('fir_title'),
            fields: [t('name'), t('incident_date'), t('incident_location'), t('description_incident'), t('suspect_details')],
            generate: (data) => {
                const doc = new jsPDF();
                doc.setFontSize(16);
                doc.text(t('fir_title'), 105, 20, null, null, "center");

                doc.setFontSize(12);
                doc.text(`To,\nThe Station House Officer,\n[Police Station Name],\n[City]`, 20, 40);

                doc.text(`Subject: Complaint regarding incident on ${data[t('incident_date')] || '[Date]'}`, 20, 70);

                const body = `Sir/Madam,\n\nI, ${data[t('name')] || '[Name]'}, wish to report an incident that occurred at ${data[t('incident_location')] || '[Location]'} on ${data[t('incident_date')] || '[Date]'}.\n\nDetails:\n${data[t('description_incident')] || '[Description]'}\n\nSuspect Details: ${data[t('suspect_details')] || 'Unknown'}\n\nI request you to register an FIR and take necessary action.\n\nSincerely,\n${data[t('name')] || '[Name]'}\n[Phone Number]`;

                const splitText = doc.splitTextToSize(body, 170);
                doc.text(splitText, 20, 90);

                doc.save("FIR_Draft.pdf");
            }
        },
        RTI: {
            title: t('rti_title'),
            fields: [t('name'), t('department'), t('info_required'), t('time_period')],
            generate: (data) => {
                const doc = new jsPDF();
                doc.setFontSize(16);
                doc.text(t('rti_title'), 105, 20, null, null, "center");

                doc.setFontSize(12);
                doc.text(`To,\nThe Public Information Officer,\n${data[t('department')] || '[Department]'}`, 20, 40);

                doc.text(`Subject: Application under Right to Information Act, 2005`, 20, 60);

                const body = `Sir/Madam,\n\nPlease provide the following information:\n${data[t('info_required')] || '[Info]'}\n\nPeriod: ${data[t('time_period')] || '[Period]'}\n\nI am attaching the application fee.\n\nSincerely,\n${data[t('name')] || '[Name]'}`;

                const splitText = doc.splitTextToSize(body, 170);
                doc.text(splitText, 20, 80);

                doc.save("RTI_Application.pdf");
            }
        },
        Consumer: {
            title: t('consumer_title'),
            fields: [t('name'), t('company_name'), t('product_details'), t('defect_description'), t('relief_sought')],
            generate: (data) => {
                const doc = new jsPDF();
                doc.setFontSize(16);
                doc.text(t('consumer_title'), 105, 20, null, null, "center");

                doc.setFontSize(12);
                doc.text(`To,\nThe Manager,\n${data[t('company_name')] || '[Company]'}`, 20, 40);

                doc.text(`Subject: Complaint regarding defective product`, 20, 60);

                const body = `Sir/Madam,\n\nI purchased ${data[t('product_details')] || '[Product]'} from your store/website.\n\nHowever, the product is defective/service is deficient as follows:\n${data[t('defect_description')] || '[Defect]'}\n\nI request you to provide the following relief: ${data[t('relief_sought')] || '[Relief]'} within 15 days, failing which I will approach the Consumer Forum.\n\nSincerely,\n${data[t('name')] || '[Name]'}`;

                const splitText = doc.splitTextToSize(body, 170);
                doc.text(splitText, 20, 80);

                doc.save("Consumer_Complaint.pdf");
            }
        }
    };

    const [selectedTemplate, setSelectedTemplate] = useState('FIR');
    const [formData, setFormData] = useState({});

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleDownload = () => {
        TEMPLATES[selectedTemplate].generate(formData);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">{t('legal_templates')}</h2>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {Object.keys(TEMPLATES).map(key => (
                    <button
                        key={key}
                        onClick={() => setSelectedTemplate(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border whitespace-nowrap ${selectedTemplate === key ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}
                    >
                        {key}
                    </button>
                ))}
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-semibold mb-4">{TEMPLATES[selectedTemplate].title}</h3>
                <div className="space-y-3">
                    {TEMPLATES[selectedTemplate].fields.map(field => (
                        <div key={field}>
                            <label className="block text-xs font-medium text-gray-500 mb-1">{field}</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={(e) => handleChange(field, e.target.value)}
                                placeholder={`${t('enter')}${field}`}
                            />
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleDownload}
                    className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                >
                    <Download size={18} /> {t('download_pdf')}
                </button>
            </div>
        </div>
    );
}

