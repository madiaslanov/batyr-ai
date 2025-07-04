// import { useState } from "react";
// import { useForm, FormProvider } from "react-hook-form";
import style from "./generateComics.module.css";
// import {ProgressBar} from "./pages/progressBar.tsx";
// import {Step1UploadPhoto} from "./pages/step1UploadPhoto.tsx";
// import {Step2WriteScript} from "./pages/step2WriteScript.tsx";
// import {Step3Download} from "./pages/step3Download.tsx";
import InProcessPage from "../../service/inProcessPage/inProcessPage.tsx";

export interface formType {
    photo?: string | null;
}

const GenerateComics = () => {
    // const [step, setStep] = useState(1);
    // const methods = useForm({
    //     defaultValues: {
    //         photo: null,
    //         script: ""
    //     }
    // });
    //
    // const goNext = () => setStep((prev) => Math.min(prev + 1, 3));
    // const goBack = () => setStep((prev) => Math.max(prev - 1, 1));

    return (
        <div className={style.genPage}>
            <InProcessPage/>
            {/*<FormProvider {...methods}>*/}
            {/*    <ProgressBar step={step}/>*/}

            {/*    {step === 1 && <Step1UploadPhoto onNext={goNext}/>}*/}
            {/*    {step === 2 && <Step2WriteScript onNext={goNext} onBack={goBack}/>}*/}
            {/*    {step === 3 && <Step3Download onBack={goBack}/>}*/}
            {/*</FormProvider>*/}
        </div>
    );
};

export default GenerateComics;
