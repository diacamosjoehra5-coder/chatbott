import { useEffect, useRef, useState } from 'react'
import { AlertCircle, BookOpen, Bot, FileText, RotateCcw, Send, UserRound } from 'lucide-react'
import './App.css'

const welcomeMessage = {
  role: 'model',
  text: 'Hello! I’m CampusGuide AI. Ask me anything about the Income-Generating Project Manual.',
  isWelcome: true,
}

const quickPrompts = [
  'Summarize the manual in 5 points',
  'How do I prepare a project proposal?',
  'What records should we keep?',
]

export default function App() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState([welcomeMessage])
  const sendingRef = useRef(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  async function handleSend(customText) {
    const question = (customText ?? input).trim()
    if (!question || sendingRef.current) return

    sendingRef.current = true
    setError('')
    setIsLoading(true)

    const history = messages
      .filter((message) => !message.isWelcome)
      .slice(-8)
      .map(({ role, text }) => ({ role, text }))

    setMessages((previous) => [...previous, { role: 'user', text: question }])
    setInput('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`)
      if (typeof data.answer !== 'string' || !data.answer.trim()) {
        throw new Error('The assistant returned an empty response.')
      }
      setMessages((previous) => [...previous, { role: 'model', text: data.answer }])
    } catch (requestError) {
      setError(requestError.message || 'Unable to connect to the chatbot.')
    } finally {
      sendingRef.current = false
      setIsLoading(false)
    }
  }

  function resetChat() {
    if (sendingRef.current) return
    setMessages([welcomeMessage])
    setInput('')
    setError('')
  }

  return (
    <div className="chat-app">
      <header className="chat-header">
        <div className="brand-lockup">
          <span className="brand-icon"><BookOpen size={19} /></span>
          <div><h1>CampusGuide AI</h1><span>Project manual assistant</span></div>
        </div>
        <button className="reset-button" type="button" onClick={resetChat} disabled={isLoading}>
          <RotateCcw size={15} /> <span>New chat</span>
        </button>
      </header>

      <main className="chat-main">
        <div className="chat-column">
          <div className="source-banner">
            <span className="source-icon"><FileText size={17} /></span>
            <div><strong>Income-Generating Project Manual</strong><span>Answers are based on this reference document.</span></div>
            <span className="source-status"><i /> Ready</span>
          </div>

          <section className="messages" aria-label="Conversation" aria-live="polite">
            {messages.map((message, index) => {
              const isUser = message.role === 'user'
              return (
                <article className={`message ${isUser ? 'message-user' : 'message-assistant'}`} key={`${index}-${message.role}`}>
                  <span className={`message-avatar ${isUser ? 'user-avatar' : 'assistant-avatar'}`}>
                    {isUser ? <UserRound size={16} /> : <Bot size={17} />}
                  </span>
                  <div className="message-body">
                    {!isUser && <div className="message-sender">CampusGuide</div>}
                    <div className="message-bubble">{message.text}</div>
                  </div>
                </article>
              )
            })}

            {isLoading && (
              <article className="message message-assistant">
                <span className="message-avatar assistant-avatar"><Bot size={17} /></span>
                <div className="message-body"><div className="message-sender">CampusGuide</div><div className="message-bubble typing-bubble"><i /><i /><i /><span>Looking through the manual…</span></div></div>
              </article>
            )}
            <div ref={messagesEndRef} />
          </section>

          {error && <div role="alert" className="error-banner"><AlertCircle size={17} /><span>{error}</span></div>}
        </div>
      </main>

      <div className="suggestions">
        <div className="suggestions-inner"><span className="suggestion-label">Try asking</span>
          {quickPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => handleSend(prompt)} disabled={isLoading}>{prompt}</button>)}
        </div>
      </div>

      <footer className="chat-footer">
        <form className="composer" onSubmit={(event) => { event.preventDefault(); handleSend() }}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSend() } }}
            disabled={isLoading}
            placeholder="Ask a question about the project manual…"
            aria-label="Ask a question about the project manual"
            rows={1}
            maxLength={4000}
          />
          <button className="send-button" type="submit" disabled={isLoading || !input.trim()} aria-label="Send message"><Send size={17} /></button>
        </form>
        <p>Responses are generated from the project manual. Verify important details against the document.</p>
      </footer>
    </div>
  )
}
