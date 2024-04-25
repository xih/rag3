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

const formSchema = z.object({
  username: z.string().min(2).max(50),
});

const submitPaperFormSchema = z.object({
  paperUrl: z.string(),
  name: z.string(),
  pagesToDelete: z.string().optional(),
});

export default function Home() {
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  function onPaperSubmitForm(values: z.infer<typeof submitPaperFormSchema>) {
    console.log(values);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* two divs one for paper Url Submission, another for question and answer */}
      <div className="flex flex-col gap-2 border-b-02  mx-auto mt-8">
        <Form {...submitPaperFrom}>
          <form
            onSubmit={submitPaperFrom.handleSubmit(onPaperSubmitForm)}
            className="space-y-8"
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
                  <FormDescription>Input the name of the paper</FormDescription>
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
    </div>
  );
}
