'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input, Textarea } from '@/components/shared/Input';
import { usePortalStore } from '@/lib/store';
import { CheckCircle2, ArrowLeft, Video } from 'lucide-react';

export default function StudentTaskSubmitPage() {
  const router = useRouter();
  const { tasks, submitTaskVideo } = usePortalStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id || 'task-1');
  const [learnedSummary, setLearnedSummary] = useState('');
  const [keyTakeaway, setKeyTakeaway] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFileUploaded, setVideoFileUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!learnedSummary) return;
      setStep(3);
    } else if (step === 3) {
      setIsSubmitting(true);
      setTimeout(() => {
        submitTaskVideo(
          selectedTaskId,
          videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-microchip-extreme-close-up-41315-large.mp4'
        );
        setIsSubmitting(false);
        setSubmitted(true);
      }, 900);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3);
    } else {
      router.push('/student/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-between max-w-xl mx-auto py-4">
      
      {/* Top Header & Progress */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-[14px] text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 1 ? 'Cancel' : 'Back'}</span>
          </button>
          <span className="text-[13px] font-medium text-[#6B7280]">
            Step {step} of 3
          </span>
        </div>

        {/* 3 Step Bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`h-1.5 rounded-full ${step >= 1 ? 'bg-[#2563EB]' : 'bg-[#E5E7EB]'}`} />
          <div className={`h-1.5 rounded-full ${step >= 2 ? 'bg-[#2563EB]' : 'bg-[#E5E7EB]'}`} />
          <div className={`h-1.5 rounded-full ${step >= 3 ? 'bg-[#2563EB]' : 'bg-[#E5E7EB]'}`} />
        </div>
      </div>

      {/* Main Step Content */}
      <div className="my-8">
        {submitted ? (
          <Card className="text-center py-12 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto" />
            <h2 className="text-[22px] font-bold text-[#0A0A0A]">
              30-Second Assignment Submitted!
            </h2>
            <p className="text-[14px] text-[#6B7280] max-w-md mx-auto">
              Your daily learning video and notes have been delivered to Team Lead and queued for Super Admin review.
            </p>
            <div className="pt-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push('/student/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 space-y-6 text-left">
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-[22px] font-bold text-[#0A0A0A]">
                    Select Assigned Task
                  </h2>
                  <p className="text-[14px] text-[#6B7280] mt-1">
                    Choose the assignment milestone you completed today.
                  </p>
                </div>

                <div className="space-y-3">
                  {tasks.map((task) => (
                    <label
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`block p-4 rounded-xl border cursor-pointer transition-colors ${
                        selectedTaskId === task.id
                          ? 'border-[#2563EB] bg-[#F8F9FA]'
                          : 'border-[#E5E7EB] bg-white hover:border-[#0A0A0A]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-[15px] font-bold text-[#0A0A0A]">{task.title}</p>
                          <p className="text-[13px] text-[#6B7280]">{task.description}</p>
                          <p className="text-[12px] text-[#6B7280]">
                            Due: {task.deadline} • Assigned by: {task.assignedBy}
                          </p>
                        </div>
                        <input
                          type="radio"
                          name="selectedTask"
                          checked={selectedTaskId === task.id}
                          onChange={() => setSelectedTaskId(task.id)}
                          className="mt-1 w-4 h-4 text-[#2563EB]"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-[22px] font-bold text-[#0A0A0A]">
                    What Did You Learn Today?
                  </h2>
                  <p className="text-[14px] text-[#6B7280] mt-1">
                    Summarize your core engineering breakthrough or findings.
                  </p>
                </div>

                <Textarea
                  label="Learning Summary"
                  placeholder="e.g. Configured ADC sampling rate to 1000Hz on ESP32 to eliminate power line harmonics..."
                  rows={4}
                  value={learnedSummary}
                  onChange={(e) => setLearnedSummary(e.target.value)}
                  required
                />

                <Input
                  label="Primary Hardware / Software Tool Used"
                  placeholder="e.g. PlatformIO, Oscilloscope, Mosquitto MQTT"
                  value={keyTakeaway}
                  onChange={(e) => setKeyTakeaway(e.target.value)}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-[22px] font-bold text-[#0A0A0A]">
                    Upload 30-Second Video
                  </h2>
                  <p className="text-[14px] text-[#6B7280] mt-1">
                    Upload or link a 30-second screen capture or phone video explaining your circuit or code.
                  </p>
                </div>

                {/* Video Dropzone / Simulator */}
                <div
                  onClick={() => setVideoFileUploaded(true)}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    videoFileUploaded ? 'border-[#10B981] bg-[#F8F9FA]' : 'border-[#E5E7EB] hover:border-[#2563EB]'
                  }`}
                >
                  <Video className="w-10 h-10 text-[#2563EB] mx-auto mb-2" />
                  {videoFileUploaded ? (
                    <p className="text-[14px] font-medium text-[#10B981]">
                      ✓ video_learning_log_30s.mp4 (Ready to submit)
                    </p>
                  ) : (
                    <>
                      <p className="text-[14px] font-medium text-[#0A0A0A]">
                        Click to select 30-second video file
                      </p>
                      <p className="text-[12px] text-[#6B7280] mt-1">
                        MP4, MOV, or WebM up to 50MB (Stored via Cloudflare/Cloudinary)
                      </p>
                    </>
                  )}
                </div>

                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-[#E5E7EB] w-full" />
                  <span className="bg-white px-2 text-[12px] text-[#6B7280] absolute">
                    or paste link
                  </span>
                </div>

                <Input
                  label="Direct Video URL (Cloudflare Stream, Loom, Google Drive)"
                  placeholder="https://..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Fixed Blue Next / Submit Button at Bottom */}
      {!submitted && (
        <div className="sticky bottom-0 bg-white/95 py-4 border-t border-[#E5E7EB] -mx-4 sm:-mx-6 px-4 sm:px-6">
          <Button
            variant="primary"
            size="lg"
            className="w-full text-[16px] py-3"
            onClick={handleNext}
            disabled={isSubmitting || (step === 2 && !learnedSummary)}
          >
            {isSubmitting
              ? 'Uploading Video...'
              : step === 3
              ? 'Submit 30-Second Assignment'
              : 'Next Step'}
          </Button>
        </div>
      )}

    </div>
  );
}