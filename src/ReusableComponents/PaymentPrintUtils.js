import { dayjs } from "@utils/dateUtils";
import { userLoginDetails } from "@/stores/LoginStore";
import { getFacilityLogo, getFacilityDetail } from "@/serviceApis";

export const printPaymentSummaryBill = async ({ paymentObj, setShowAlert }) => {
  if (!paymentObj?.token_number || !paymentObj?.token_date) {
    setShowAlert({
      show: true,
      message: "Missing token details for printing summary bill",
      status: "error",
    });
    return;
  }

  const formattedTokenDate = paymentObj.token_date
    ? dayjs(paymentObj.token_date).format("DD-MM-YYYY")
    : "-";

  const consultationTotal =
    parseFloat(paymentObj.consultation_fee || 0) || 0;
  const consultationPaid =
    parseFloat(paymentObj.consultation_paid_amount || 0) || 0;
  const consultationPending =
    parseFloat(paymentObj.consultation_pending || 0) || 0;

  const labTotal = parseFloat(paymentObj.lab_fee || 0) || 0;
  const labPaid = parseFloat(paymentObj.lab_paid_amount || 0) || 0;
  const labPending = parseFloat(paymentObj.lab_pending || 0) || 0;

  const pharmacyTotal = parseFloat(paymentObj.pharmacy_fee || 0) || 0;
  const pharmacyPaid =
    parseFloat(paymentObj.pharmacy_paid_amount || 0) || 0;
  const pharmacyPending =
    parseFloat(paymentObj.pharmacy_pending || 0) || 0;

  const procedureTotal =
    parseFloat(paymentObj.procedure_fee || 0) || 0;
  const procedurePaid =
    parseFloat(paymentObj.procedure_paid_amount || 0) || 0;
  const procedurePending =
    parseFloat(paymentObj.procedure_pending || 0) || 0;

  const totalAmount = parseFloat(paymentObj.total_amount || 0) || 0;
  const totalPaid = parseFloat(paymentObj.total_paid || 0) || 0;
  const totalPending =
    parseFloat(paymentObj.total_pending || 0) || 0;

  const methodStr = paymentObj.payment_method || "-";

  const userObj = userLoginDetails.getState ? userLoginDetails.getState() : {};
  const facilityId = userObj?.facility_id || 1;

  let logoSrc = null;
  let facilityDetail = null;

  try {
    const logoBlob = await getFacilityLogo(facilityId);
    if (logoBlob instanceof Blob) {
      logoSrc = URL.createObjectURL(logoBlob);
    }
  } catch (e) {}

  try {
    facilityDetail = await getFacilityDetail(facilityId);
  } catch (e) {}

  const win = window.open("", "_blank", "width=1100,height=650");
  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>Payment Receipt</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #000000; max-width: 900px; margin: 0 auto; line-height: 1.5; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
          .logo { max-height: 180px; max-width: 360px; object-fit: contain; margin: 0 auto 10px auto; display: block; }
          .subtitle { font-size: 13px; color: #000000; margin-top: 4px; }
          .bill-info { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
          .info-group { display: flex; flex-direction: column; gap: 8px; }
          .info-row { display: flex; gap: 12px; font-size: 14px; }
          .label { font-weight: 600; color: #000000; min-width: 110px; }
          .value { color: #000000; font-weight: 500; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
          th { background-color: #f3f4f6; color: #000000; font-weight: 600; padding: 12px 16px; text-align: left; border-bottom: 2px solid #e5e7eb; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
          td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #000000; }
          tr:last-child td { border-bottom: none; }
          .numeric { text-align: right; font-variant-numeric: tabular-nums; }
          .total-row { background-color: #ecfdf5; font-weight: 700; }
          .total-section { margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
          .total-section div { font-size: 15px; font-weight: 600; color: #000000; display: flex; justify-content: space-between; width: 220px; }
          .total-section div:nth-child(2) { color: #16a34a; }
          .total-section div:nth-child(3) { color: #dc2626; }
          .signature { margin-top: 50px; text-align: right; font-weight: 600; padding-right: 20px; color: #000000; }
          .signature:before { content: ""; display: block; width: 200px; height: 1px; background: #000000; margin-left: auto; margin-bottom: 10px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          @media print { body { padding: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          ${
            logoSrc
              ? `<img src="${logoSrc}" class="logo" alt="Logo" />`
              : ""
          }
          ${
            facilityDetail
              ? `<div style="font-size: 13px; color: #000000; margin-top: 4px;">
                  ${facilityDetail.FacilityAddress || ""} | Ph: ${
                  facilityDetail.phone_number || "-"
                } | Email: ${facilityDetail.email || "-"}
                </div>`
              : '<div class="subtitle">Summary of payments recorded against this token</div>'
          }
        </div>

        <div class="bill-info">
          <div class="info-group">
            <div class="info-row">
              <span class="label">Token Number:</span>
              <span class="value">${paymentObj.token_number}</span>
            </div>
            <div class="info-row">
              <span class="label">Payment Method:</span>
              <span class="value">${methodStr}</span>
            </div>
          </div>
          <div class="info-group" style="text-align: right;">
            <div class="info-row">
              <span class="label">Token Date:</span>
              <span class="value">${formattedTokenDate}</span>
            </div>
            <div class="info-row">
              <span class="label">Bill Type:</span>
              <span class="value">Payment Receipt</span>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th class="numeric">Total</th>
              <th class="numeric">Paid</th>
              <th class="numeric">Pending</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Consultation</td>
              <td class="numeric">₹${consultationTotal.toFixed(2)}</td>
              <td class="numeric">₹${consultationPaid.toFixed(2)}</td>
              <td class="numeric">₹${consultationPending.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Lab</td>
              <td class="numeric">₹${labTotal.toFixed(2)}</td>
              <td class="numeric">₹${labPaid.toFixed(2)}</td>
              <td class="numeric">₹${labPending.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Pharmacy</td>
              <td class="numeric">₹${pharmacyTotal.toFixed(2)}</td>
              <td class="numeric">₹${pharmacyPaid.toFixed(2)}</td>
              <td class="numeric">₹${pharmacyPending.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Procedure</td>
              <td class="numeric">₹${procedureTotal.toFixed(2)}</td>
              <td class="numeric">₹${procedurePaid.toFixed(2)}</td>
              <td class="numeric">₹${procedurePending.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>Total</td>
              <td class="numeric">₹${totalAmount.toFixed(2)}</td>
              <td class="numeric">₹${totalPaid.toFixed(2)}</td>
              <td class="numeric">₹${totalPending.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-section">
          <div>
            <span>Bill Total</span>
            <span>₹${totalAmount.toFixed(2)}</span>
          </div>
          <div>
            <span>Total Paid</span>
            <span>₹${totalPaid.toFixed(2)}</span>
          </div>
          <div>
            <span>Total Pending</span>
            <span>₹${totalPending.toFixed(2)}</span>
          </div>
        </div>

        <div class="signature">
          Authorized Signatory
        </div>

        <div class="footer">
          <p>Thank you for choosing our facility. We wish you a speedy recovery!</p>
          <p>This is a computer-generated invoice and does not require a physical seal.</p>
        </div>
      </body>
    </html>
  `);

  win.document.close();
  win.onload = () => {
    setTimeout(() => {
      try {
        win.print();
      } catch (e) {}
    }, 300);
  };
};
