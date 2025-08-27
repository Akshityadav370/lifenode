import { VALID_MODELS, ValidModel } from '@/constants/valid_model';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Send, Copy, Trash } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';
import { Input } from '../ui/input';
import { ChatHistory, parseChatHistory } from '@/db/chat-types';
import { useChatService } from '@/hooks/useChatService';
import { ModelService } from '@/db/services/model-service';
import { extractCode } from '@/models/utils';
import { SYSTEM_PROMPT } from '@/constants/prompt';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

const LIMIT_VALUE = 10;

const ChatBox = ({
  context,
  visible,
  model,
  apiKey,
}: {
  visible: boolean;
  context: {
    problemStatement: string;
  };
  model: ValidModel;
  apiKey: string;
}) => {
  const [value, setValue] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [previousChatHistory, setPreviousChatHistory] = useState<ChatHistory[]>(
    []
  );

  const [isResponseLoading, setIsResponseLoading] = useState<boolean>(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const [offset, setOffset] = useState<number>(0);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [isPreviousMsgLoading, setIsPreviousMsgLoading] =
    useState<boolean>(false);

  const { fetchChatHistory, saveChatHistory, clearChatHistory } =
    useChatService();

  const getProblemName = () => {
    const url = window.location.href;
    const match = /\/problems\/([^/]+)/.exec(url);
    return match ? match[1] : 'Unknown Problem';
  };

  const problemName = getProblemName();
  const inputFieldRef = useRef<HTMLInputElement>(null);

  /**
   * Handles the generation of an AI response.
   *
   * This function performs the following steps:
   * 1. Initializes a new instance of `ModalService`.
   * 2. Selects a modal using the provided model and API key.
   * 3. Determines the programming language from the UI.
   * 4. Extracts the user's current code from the document.
   * 5. Modifies the system prompt with the problem statement, programming language, and extracted code.
   * 6. Generates a response using the modified system prompt.
   * 7. Updates the chat history with the generated response or error message.
   * 8. Scrolls the chat box into view.
   *
   * @async
   * @function handleGenerateAIResponse
   * @returns {Promise<void>} A promise that resolves when the AI response generation is complete.
   */
  const handleGenerateAIResponse = async (): Promise<void> => {
    const modalService = new ModelService();

    modalService.selectModal(model, apiKey);

    let programmingLanguage = 'UNKNOWN';

    const changeLanguageButton = document.querySelector(
      'button.rounded.items-center.whitespace-nowrap.inline-flex.bg-transparent.dark\\:bg-dark-transparent.text-text-secondary.group'
    );
    if (changeLanguageButton) {
      if (changeLanguageButton.textContent)
        programmingLanguage = changeLanguageButton.textContent;
    }
    const userCurrentCodeContainer = document.querySelectorAll('.view-line');

    const extractedCode = extractCode(userCurrentCodeContainer);

    const systemPromptModified = SYSTEM_PROMPT.replace(
      /{{problem_statement}}/gi,
      context.problemStatement
    )
      .replace(/{{programming_language}}/g, programmingLanguage)
      .replace(/{{user_code}}/g, extractedCode);

    const PCH = parseChatHistory(chatHistory);

    const { error, success } = await modalService.generate({
      prompt: `${value}`,
      systemPrompt: systemPromptModified,
      messages: PCH,
      extractedCode: extractedCode,
    });

    if (error) {
      const errorMessage: ChatHistory = {
        role: 'assistant',
        content: error.message,
      };
      await saveChatHistory(problemName, [
        ...previousChatHistory,
        { role: 'user', content: value },
        errorMessage,
      ]);
      setPreviousChatHistory((prev) => [...prev, errorMessage]);
      setChatHistory((prev) => {
        const updatedChatHistory: ChatHistory[] = [...prev, errorMessage];
        return updatedChatHistory;
      });
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    if (success) {
      const res: ChatHistory = {
        role: 'assistant',
        content: success,
      };
      await saveChatHistory(problemName, [
        ...previousChatHistory,
        { role: 'user', content: value },
        res,
      ]);
      setPreviousChatHistory((prev) => [...prev, res]);
      setChatHistory((prev) => [...prev, res]);
      setValue('');
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    setIsResponseLoading(false);
    setTimeout(() => {
      inputFieldRef.current?.focus();
    }, 0);
  };

  const handleClearChat = useCallback(async () => {
    await clearChatHistory(problemName);
    setChatHistory([]);
    setPreviousChatHistory([]);
  }, [problemName]);

  const loadInitialChatHistory = useCallback(async () => {
    const { totalMessageCount, chatHistory, allChatHistory } =
      await fetchChatHistory(problemName, LIMIT_VALUE, 0);
    setPreviousChatHistory(allChatHistory || []);

    setTotalMessages(totalMessageCount);
    setChatHistory(chatHistory);
    setOffset(LIMIT_VALUE);
  }, [problemName]);

  const loadMoreMessages = useCallback(async () => {
    if (totalMessages < offset) {
      return;
    }
    setIsPreviousMsgLoading(true);
    const { chatHistory: moreMessages } = await fetchChatHistory(
      problemName,
      LIMIT_VALUE,
      offset
    );

    if (moreMessages.length > 0) {
      setChatHistory((prev) => [...moreMessages, ...prev]); // Correctly merge the new messages with the previous ones
      setOffset((prevOffset) => prevOffset + LIMIT_VALUE);
    }

    setTimeout(() => {
      setIsPreviousMsgLoading(false);
    }, 500);
  }, [offset, problemName]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop === 0) {
      console.log('Reached the top, loading more messages...');
      loadMoreMessages();
    }
  };

  const onSendMessage = async (value: string) => {
    setIsResponseLoading(true);
    const newMessage: ChatHistory = { role: 'user', content: value };

    setPreviousChatHistory((prev) => {
      return [...prev, newMessage];
    });
    setChatHistory([...chatHistory, newMessage]);

    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    handleGenerateAIResponse();
  };

  useEffect(() => {
    loadInitialChatHistory();
  }, [problemName]);

  useEffect(() => {
    if (lastMessageRef.current && !isPreviousMsgLoading) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    setTimeout(() => {
      inputFieldRef.current?.focus();
    }, 0);
  }, [chatHistory, isResponseLoading, visible]);

  if (!visible) return <></>;

  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary')
    .trim();
  const shadowColor = primaryColor || '#3b82f6';

  return (
    <Card
      className="mb-2"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
        boxShadow: `0 10px 25px -3px ${shadowColor}40, 0 4px 6px -2px ${shadowColor}20`,
      }}
    >
      <div
        className="flex items-center justify-between rounded-t-lg p-4"
        style={{
          backgroundColor: 'var(--surface)',
          borderBottomColor: 'var(--border)',
          borderBottomWidth: '1px',
        }}
      >
        <div className="flex gap-2 items-center justify-start">
          <div>
            <h3
              className="font-semibold text-lg capitalize"
              style={{ color: 'var(--text)' }}
            >
              {problemName.split('-').join(' ')}
            </h3>
            <p className="text-xs text-gray-400">
              {VALID_MODELS.find((m) => m.name === model).display}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="text-sm p-1 hover:opacity-80 bg-transparent"
            onClick={handleClearChat}
            style={{
              color: 'var(--error)',
            }}
          >
            <Trash />
          </Button>
        </div>
      </div>
      <CardContent
        className="p-2 px-4"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        {chatHistory.length > 0 ? (
          <ScrollArea
            className="space-y-4 h-[500px] w-[600px] p-2"
            ref={scrollAreaRef}
            onScroll={handleScroll}
            style={{ backgroundColor: 'var(--background)' }}
          >
            {totalMessages > offset && (
              <div className="flex w-full items-center justify-center">
                <Button
                  className="text-sm p-1 m-x-auto hover:opacity-80"
                  onClick={loadMoreMessages}
                  style={{
                    backgroundColor: 'var(--secondary)',
                    color: 'var(--text)',
                    border: `1px solid var(--border)`,
                  }}
                >
                  Load Previous Messages
                </Button>
              </div>
            )}
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex w-max max-w-[75%] flex-col gap-2 px-3 py-2 text-sm my-4 rounded-lg',
                  message.role === 'user'
                    ? 'ml-auto rounded-bl-lg rounded-tl-lg rounded-tr-lg'
                    : 'rounded-br-lg rounded-tl-lg rounded-tr-lg'
                )}
                style={{
                  backgroundColor:
                    message.role === 'user'
                      ? 'var(--primary)'
                      : 'var(--surface)',
                  color: message.role === 'user' ? 'white' : 'var(--text)',
                  border:
                    message.role === 'assistant'
                      ? `1px solid var(--border)`
                      : 'none',
                }}
              >
                <>
                  <p className="max-w-80">
                    {typeof message.content === 'string'
                      ? message.content
                      : message.content.feedback}
                  </p>

                  {!(typeof message.content === 'string') && (
                    <Accordion type="multiple">
                      {message.content?.hints &&
                        message.content.hints.length > 0 && (
                          <AccordionItem value="item-1" className="max-w-80">
                            <AccordionTrigger style={{ color: 'var(--text)' }}>
                              Hints 👀
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="gap-4 flex flex-col">
                                {message.content?.hints?.map((e) => (
                                  <li
                                    key={e}
                                    className="p-2 rounded-md"
                                    style={{
                                      border: `1px solid var(--border)`,
                                      backgroundColor: 'var(--background)',
                                      color: 'var(--text)',
                                    }}
                                  >
                                    {e}
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        )}
                      {message.content?.snippet && (
                        <AccordionItem value="item-2" className="max-w-80">
                          <AccordionTrigger style={{ color: 'var(--text)' }}>
                            <div className="flex gap-2">
                              <span>Code 🧑🏻‍💻</span>
                              <Copy
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (typeof message.content !== 'string')
                                    navigator.clipboard.writeText(
                                      `${message.content?.snippet}`
                                    );
                                }}
                                className="h-4 w-4"
                                style={{ color: 'var(--text)' }}
                              />
                            </div>
                          </AccordionTrigger>

                          <AccordionContent>
                            <div className="mt-4 rounded-md">
                              <div className="relative">
                                <Highlight
                                  theme={themes.dracula}
                                  code={message.content?.snippet || ''}
                                  language={
                                    message.content?.programmingLanguage?.toLowerCase() ||
                                    'javascript'
                                  }
                                >
                                  {({
                                    className,
                                    style,
                                    tokens,
                                    getLineProps,
                                    getTokenProps,
                                  }) => (
                                    <pre
                                      style={style}
                                      className={cn(
                                        className,
                                        'p-3 rounded-md'
                                      )}
                                    >
                                      {tokens.map((line, i) => (
                                        <div
                                          key={i}
                                          {...getLineProps({ line })}
                                        >
                                          {line.map((token, key) => (
                                            <span
                                              key={key}
                                              {...getTokenProps({ token })}
                                            />
                                          ))}
                                        </div>
                                      ))}
                                    </pre>
                                  )}
                                </Highlight>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  )}
                </>
              </div>
            ))}
            {isResponseLoading && (
              <div
                style={{ color: 'var(--text-muted)' }}
                className="flex items-center gap-2"
              >
                <span className="animate-pulse">🤔 Generating response...</span>
              </div>
            )}
            <div ref={lastMessageRef} />
          </ScrollArea>
        ) : (
          <div>
            <p
              className="flex items-center justify-center h-[510px] w-[400px] text-center space-y-4"
              style={{ color: 'var(--text-muted)' }}
            >
              No messages yet.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter
        style={{
          backgroundColor: 'var(--surface)',
          borderTopColor: 'var(--border)',
          borderTopWidth: '1px',
        }}
        className="p-2 px-4"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (value.trim().length === 0) return;
            onSendMessage(value);
            setValue('');
          }}
          className="flex w-full items-center space-x-2"
        >
          <Input
            id="message"
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={isResponseLoading}
            required
            ref={inputFieldRef}
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          />
          <Button
            type="submit"
            className="rounded-lg"
            size="icon"
            disabled={value.length === 0}
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              opacity: value.length === 0 ? 0.5 : 1,
            }}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatBox;
