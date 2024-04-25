// 4-25-2024
// 1. make another form field that contains the question to ask the agent
// 2. make anoteher api route /qa that returns the answer to the question and follow up questions

import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronsUpDown, Plus, X } from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { useState } from "react";
import { ArxivPaperNote } from "./api/take_notes";

const formSchema = z.object({
  username: z.string().min(2).max(50),
});

const submitPaperFormSchema = z.object({
  paperUrl: z.string(),
  name: z.string(),
  pagesToDelete: z.string().optional(),
});

const submitQuestionFormSchema = z.object({
  question: z.string().min(1),
});

type SubmitFormData = {
  paperUrl: string;
  name: string;
  pagesToDelete: Array<number> | undefined;
};

type Notes = {
  notes: Array<Document>;
  pageNumbers: Array<number>;
}[];

export default function Home() {
  const [submittedFormData, setSubmittedFormData] = useState<SubmitFormData>();
  const [notes, setNotes] = useState<Array<ArxivPaperNote>>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  const submitPaperFrom = useForm<z.infer<typeof submitPaperFormSchema>>({
    resolver: zodResolver(submitPaperFormSchema),
    defaultValues: {
      paperUrl: "https://www.arxiv.com",
    },
  });

  const submitQuestionForm = useForm<z.infer<typeof submitQuestionFormSchema>>({
    resolver: zodResolver(submitQuestionFormSchema),
    defaultValues: {
      question: "why is the sky blue?",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  const processPagesToDelete = (pagesToDelete: string): number[] => {
    return pagesToDelete.split(",").map(Number);
  };

  async function onQuestionSubmitForm(
    values: z.infer<typeof submitQuestionFormSchema>
  ) {
    console.log(values);
  }

  async function onPaperSubmitForm(
    values: z.infer<typeof submitPaperFormSchema>
  ) {
    console.log(values);

    // 1. set the submitted form data to state
    // 2.
    setSubmittedFormData({
      paperUrl: values.paperUrl,
      name: values.name,
      pagesToDelete: values.pagesToDelete
        ? processPagesToDelete(values.pagesToDelete)
        : undefined,
    });

    // here we want to call the the vercel api
    const response = await fetch(`/api/take_notes`, {
      method: "post",
      body: JSON.stringify(values),
    }).then((res) => {
      if (res.ok) {
        return res.json();
      }
      return null;
    });

    if (response) {
      console.log(response, "whats the response!!");
      setNotes(response);
    } else {
      throw new Error("error while taking notes");
    }
  }

  return (
    <div className="flex flex-col gap-5 items-center">
      {/* two divs one for paper Url Submission, another for question and answer */}
      <div className="flex flex-row gap-5 mx-auto mt-8">
        <div className="flex flex-col border-2 border-gray-200 rounded-md p-2">
          <Form {...submitPaperFrom}>
            <form
              onSubmit={submitPaperFrom.handleSubmit(onPaperSubmitForm)}
              className="space-y-8 max-w-sm"
            >
              <FormField
                control={submitPaperFrom.control}
                name="paperUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paper Url</FormLabel>
                    <FormControl>
                      <Input placeholder="fasdfas" {...field} />
                    </FormControl>
                    <FormDescription>Input a paper Url</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={submitPaperFrom.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormDescription>
                      Input the name of the paper
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <p className="font-normal"> Delete pages?</p>
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <FormField
                    control={submitPaperFrom.control}
                    name="pagesToDelete"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pages to Delete</FormLabel>
                        <FormControl>
                          <Input placeholder="10, 11, 12" {...field} />
                        </FormControl>
                        <FormDescription>
                          Delete pages from the pdf
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </div>

        {/* question and answer */}
        <div className="flex flex-col border-2 border-gray-200 rounded-md p-2">
          <Form {...submitQuestionForm}>
            <form
              onSubmit={submitQuestionForm.handleSubmit(onQuestionSubmitForm)}
              className="space-y-8 max-w-sm"
            >
              <FormField
                control={submitQuestionForm.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Input placeholder="fasdfas" {...field} />
                    </FormControl>
                    <FormDescription>
                      What questions do you have about this paper?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </div>
      </div>
      {notes && notes.length > 0 && (
        <div className="flex flex-col mx-auto">
          <h2 className="">Notes</h2>
          <div className="flex flex-col gap-2">
            {notes.map((note, index) => {
              return (
                <div
                  key={index}
                  className="flex flex-col justify-start max-w-sm"
                >
                  <p>{note.note}</p>
                  <p>[{note.pageNumbers}]</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Drawer>
        <DrawerTrigger className="mt-8 flex flex-row justify-start">
          Open
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Are you absolutely sure?</DrawerTitle>
              <DrawerDescription>
                This action cannot be undone.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose>
                <Button variant="outline" className="w-full max-w-sm">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
