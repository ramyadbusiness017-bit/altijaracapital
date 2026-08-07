import { saveSetupStep } from "../../actions/setup";
import SliderStep from "../../../components/SliderStep";

export default function NetWorthPage() {
  async function handleNext(formData: FormData) {
    'use server';
    const amount = formData.get('netWorth') as string;
    await saveSetupStep({ netWorth: amount }, '/setup/annual-income');
  }

  return (
    <SliderStep 
      title="Estimate your net worth"
      name="netWorth"
      min={0}
      max={10000000}
      step={5000}
      defaultValue={50000}
      suffix=""
      action={handleNext}
    />
  );
}
