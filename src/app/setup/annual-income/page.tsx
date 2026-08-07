import { saveSetupStep } from "../../actions/setup";
import SliderStep from "../../../components/SliderStep";

export default function AnnualIncomePage() {
  async function handleNext(formData: FormData) {
    'use server';
    const amount = formData.get('annualIncome') as string;
    await saveSetupStep({ annualIncome: amount }, '/setup/main-income');
  }

  return (
    <SliderStep 
      title="What is your total yearly income (in USD)?"
      name="annualIncome"
      min={0}
      max={5000000}
      step={5000}
      defaultValue={20000}
      suffix=" a year"
      action={handleNext}
    />
  );
}
