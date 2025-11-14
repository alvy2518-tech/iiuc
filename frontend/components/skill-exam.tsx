"use client"

import { useState } from "react"
import { X, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Question {
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
}

interface ExamResult {
  passed: boolean
  score: number
  totalMarks: number
  percentage: number
  results: Array<{
    questionIndex: number
    question: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
    explanation: string
  }>
}

interface SkillExamProps {
  exam: {
    id: string
    questions: Question[]
    totalMarks: number
    passingMarks: number
    skillName: string
    skillLevel: string
  }
  onClose: () => void
  onSubmit: (examId: string, answers: Array<{ questionIndex: number; answer: string }>) => Promise<ExamResult>
}

export function SkillExam({ exam, onClose, onSubmit }: SkillExamProps) {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ExamResult | null>(null)

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }))
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== exam.questions.length) {
      alert("Please answer all questions before submitting.")
      return
    }

    setSubmitting(true)
    try {
      const answersArray = exam.questions.map((_, index) => ({
        questionIndex: index,
        answer: answers[index] || ""
      }))

      const examResult = await onSubmit(exam.id, answersArray)
      setResult(examResult)
    } catch (error: any) {
      console.error("Failed to submit exam:", error)
      alert(error.response?.data?.message || "Failed to submit exam. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const allAnswered = Object.keys(answers).length === exam.questions.length

  if (result) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 bg-white rounded-xl shadow-lg border">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Exam Results</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className={`p-6 rounded-lg ${result.passed ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
              <div className="flex items-center gap-3 mb-4">
                {result.passed ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <h3 className={`text-xl font-bold ${result.passed ? 'text-green-900' : 'text-red-900'}`}>
                    {result.passed ? "Congratulations! You Passed!" : "You Did Not Pass"}
                  </h3>
                  <p className={`text-sm ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
                    Score: {result.score}/{result.totalMarks} ({result.percentage}%)
                  </p>
                </div>
              </div>
              {result.passed ? (
                <p className="text-green-800">
                  Your skill has been verified and added to your profile!
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-red-800">
                    You need at least {exam.passingMarks} out of {exam.totalMarks} to pass. Please try again.
                  </p>
                  <Button onClick={() => { setResult(null); setAnswers({}) }} className="mt-4">
                    Retry Exam
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Question Review</h3>
              {result.results.map((item, index) => (
                <div key={index} className={`p-4 rounded-lg border ${item.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start gap-2 mb-2">
                    {item.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-2">{item.question}</p>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Your answer:</span>{" "}
                          <span className={item.isCorrect ? "text-green-700" : "text-red-700"}>
                            {item.userAnswer}
                          </span>
                        </p>
                        {!item.isCorrect && (
                          <p>
                            <span className="font-medium">Correct answer:</span>{" "}
                            <span className="text-green-700">{item.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {result.passed && (
              <Button onClick={onClose} className="w-full" size="lg">
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 bg-white rounded-xl shadow-lg border">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Skill Verification Exam</h2>
              <p className="text-sm text-gray-600 mt-1">
                {exam.skillName} - {exam.skillLevel} Level
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Instructions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Answer all {exam.questions.length} questions</li>
                  <li>You need at least {exam.passingMarks} out of {exam.totalMarks} to pass</li>
                  <li>Each question has only one correct answer</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {exam.questions.map((question, index) => (
              <div key={index} className="p-4 rounded-lg border bg-white">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-1">
                      {index + 1}
                    </Badge>
                    <p className="font-medium flex-1">{question.question}</p>
                  </div>
                  <div className="space-y-2 ml-8">
                    {Object.entries(question.options).map(([key, value]) => (
                      <label
                        key={key}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          answers[index] === key
                            ? "border-[#633ff3] bg-[#633ff3]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={key}
                          checked={answers[index] === key}
                          onChange={() => handleAnswerChange(index, key)}
                          className="w-4 h-4 text-[#633ff3]"
                        />
                        <span className="font-medium text-gray-700 mr-2">{key}.</span>
                        <span className="text-gray-700">{value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              Answered: {Object.keys(answers).length} / {exam.questions.length}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className="bg-[#633ff3] hover:bg-[#5330d4] text-white"
              >
                {submitting ? "Submitting..." : "Submit Exam"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

