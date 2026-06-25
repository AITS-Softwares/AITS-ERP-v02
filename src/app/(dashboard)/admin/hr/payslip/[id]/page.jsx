import { PayslipDemo } from "@/components/hr/HrmsDemoScreens";

export default function PayslipPage({ params }) {
  return <PayslipDemo payslipId={params.id} />;
}
