import Chatbot from '../components/features/Chatbot';

const ChatbotPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Chatbot</h1>
        <p className="text-gray-600">Ask questions about term sheets and document validation</p>
      </div>

      <Chatbot />
    </div>
  );
};

export default ChatbotPage;

