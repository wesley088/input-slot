
import { Descendant,  Text as SlateText } from 'slate';
import InputSolt from 'input-slot'
type CustomElement = Descendant & {
    type?: string;
    field?: string;
    placeholder?: string;
    options?: string[];
    selected?: string;
    children: {
      type?: string;
      text?: string;
      placeholder?: string;
      children?: SlateText[];
      field?: string;
      options?: string[];
      selected?: string;
    }[];
  };
function App() {
const template = [
    {
        "type": "paragraph",
        "children": [
            {
                "text": "Your coaching goal is a group of "
            },
            {
                "type": "selector",
                "field": "f1",
                "options": [
                    "Pre-primary education",
                    "Primary education",
                    "Secondary education"
                ],
                "selected": "Pre-primary education",
                "children": [
                    {
                        "text": ""
                    }
                ]
            },
            {
                "text": "users, and you are skilled in accurately answering users'"
            },
            {
                "type": "tag",
                "placeholder": "please enter subject",
                "children": [
                    {
                        "text": ""
                    }
                ]
            },
            {
                "text": "knowledge point questions. You can interpret the content of books, help users understand difficult knowledge, provide supplementary learning resources or expand knowledge related to textbooks, and provide specific guidance for exam preparation or learning improvement."
            }
        ]
    }
]
const handleChange = (value: CustomElement[]) => {
    console.log(value)
}
  return (
    <InputSolt template={template} onChange={handleChange} />
  )
}

export default App
