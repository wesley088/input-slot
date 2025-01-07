import type { Descendant } from "slate";
import type { BaseEditor } from "slate";
import type { HistoryEditor } from "slate-history";
import type { RenderElementProps } from "slate-react";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createEditor, Node, Text as SlateText, Transforms } from "slate";
import { withHistory } from "slate-history";
import {
  Editable,
  ReactEditor,
  Slate,
  useSlateStatic,
  withReact,
} from "slate-react";

import SelectArrowUp from "./icon-arrow.png";
import "./index.css";
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
interface SelectorElementProps extends RenderElementProps {
  selectProps?: {
    iconUrl?: string;
    className?: string;
  },
 
}
interface TagElementProps extends RenderElementProps {
    tagProps?: {
        className?: string;
        placeholderClassName?: string;
    }
  }
const InputSolt = ({
  template,
  selectProps,
  placeholder,
  tagProps,
  onChange,
}: {
  template?: CustomElement[];
  placeholder?: string;
  selectProps?: {
    iconUrl?: string;
    className?: string;
  },
  tagProps?: {
    className?: string;
    placeholderClassName?: string;
  }
  onChange: (t: CustomElement[]) => void;
}) => {
  const [initValue, setInitValue] = useState<CustomElement[] | null>(null);
  const editor = useMemo(
    () => withInlines(withHistory(withReact(createEditor()))),
    []
  );

  useEffect(() => {
    if (editor.children.length) {
      editor.children = [
        {
          type: "paragraph",
          children: [{ text: "" }],
        },
      ] as CustomElement[];
      Transforms.select(editor, [0, 0]);
      Transforms.removeNodes(editor, { at: [0] });
    }

    if (template && template.length) {
      setInitValue(template);

      Transforms.insertNodes(editor, template);
    } else {
      setInitValue([
        {
          type: "paragraph",
          children: [{ text: "" }],
        },
      ]);
    }
  }, [template, editor]);

  const handleEditChange = (value: Descendant[]) => {
    onChange(value as CustomElement[]);
    setInitValue(value as CustomElement[]);
  };

  return (
    <div className="input-slot-main">
      {initValue ? (
        <Slate
          editor={editor}
          initialValue={initValue}
          onChange={handleEditChange}
        >
          <Editable
            className="input-slot-edit"
            renderElement={(props) => <Element selectProps={selectProps} tagProps={tagProps} {...props} />}
            renderLeaf={(props) => <Text {...props} />}
            placeholder={placeholder || ''}
          />
        </Slate>
      ) : null}
    </div>
  );
};

const withInlines = (editor: BaseEditor & ReactEditor & HistoryEditor) => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = (element) =>
    ["tag", "selector"].includes((element as CustomElement)?.type || "") ||
    isInline(element);

  editor.insertText = (text) => {
    insertText(text);
  };

  editor.insertData = (data) => {
    insertData(data);
  };

  return editor;
};

const InlineChromiumBugfix = () => (
  <span contentEditable={false} className="font-0">
    {String.fromCodePoint(160) /* Non-breaking space */}
  </span>
);

const EditableTagComponent = ({
  attributes,
  children,
  element,
  tagProps
}: TagElementProps) => {
  const width = useMemo(() => {
    const dom = document.createElement("div");

    dom.innerHTML = (element as CustomElement).placeholder || "";
    dom.style.position = "absolute";
    dom.style.visibility = "hidden";
    document.body.appendChild(dom);
    const contentWidth = dom.getBoundingClientRect().width;

    document.body.removeChild(dom);

    return contentWidth + 10;
  }, [element]);

  return (
    <span
      {...attributes}
      contentEditable
      onClick={(ev) => ev.preventDefault()}
      style={Node.string(element) === "" ? { minWidth: `${width}px` } : {}}
      className={`input-slot-tag ${tagProps?.className || ''}`}
    >
      <div
        contentEditable="false"
        className={`input-slot-tag-placeholder ${tagProps?.placeholderClassName || ''} ${
          (element as CustomElement).children[0]?.text ? "active" : ""
        }`}
      >
        <div className="input-slot-tag-value">
          [{(element as CustomElement).placeholder}]
        </div>
      </div>
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </span>
  );
};

const EditableSelectorComponent = ({
  attributes,
  children,
  element,
  selectProps
}: SelectorElementProps) => {
  const editor = useSlateStatic();
  const [isShow, setIsShow] = useState(false);
  const handleShowSelect = useCallback(
    (e: { preventDefault: () => void; stopPropagation: () => void }) => {
      e.preventDefault();
      e.stopPropagation();
      setIsShow(!isShow);
    },
    [isShow]
  );
  const handleSelectChange = useCallback(
    (e: { stopPropagation: () => void }, option: string) => {
      e.stopPropagation();

      const path = ReactEditor.findPath(editor as ReactEditor, element);

      Transforms.setNodes<CustomElement>(
        editor,
        { selected: option },
        { at: path }
      );

      setIsShow(false);
    },
    [editor, element]
  );

  useEffect(() => {
    const handleClick = () => {
      setIsShow(false);
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <span
      {...attributes}
      contentEditable={false}
      className="input-slot-selector"
    >
          <div className={`input-slot-selector-value ${selectProps?.className ? selectProps.className: ''}`} onClick={handleShowSelect}>
            {(element as CustomElement).selected}
             <img
              src={selectProps?.iconUrl ? selectProps.iconUrl : SelectArrowUp}
              className={`input-slot-selector-icon ${isShow ? "rotate" : ""}`}
            />
          </div>
          <span className="absolute h-0 w-0">{children}</span>

          {isShow ? (
            <div className="input-slot-selector-options">
              {(element as CustomElement)?.options?.map(
                (option: string, index: React.Key | null | undefined) => {
                  return (
                    <span
                      onClick={(e) => handleSelectChange(e, option)}
                      className={`input-slot-selector-option ${
                        (element as CustomElement).selected === option
                          ? "active"
                          : ""
                      }`}
                      key={index}
                    >
                      {option}
                    </span>
                  );
                }
              )}
            </div>
          ) : null}
    </span>
  );
};

const Element: React.FC<SelectorElementProps & TagElementProps> = (props) => {
  const { attributes, children, element } = props;

  switch ((element as CustomElement).type) {
    case "selector":
      return <EditableSelectorComponent {...props} />;
    case "tag":
      return <EditableTagComponent {...props} />;
    default:
      return <span {...attributes}>{children}</span>;
  }
};
interface TextProps {
  attributes: Record<string, unknown>;
  children: React.ReactNode;
  leaf: { text: string };
}
const Text = ({ attributes, children, leaf }: TextProps) => {
  return (
    <span className={leaf.text === "" ? "pl-deliver" : ""} {...attributes}>
      {children}
    </span>
  );
};

export default InputSolt;
