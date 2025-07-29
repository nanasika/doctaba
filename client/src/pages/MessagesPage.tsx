import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Plus, 
  Calendar,
  User,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Message, User as SelectUser, InsertMessage } from '@shared/schema';

const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
  receiverId: z.number(),
});

type MessageForm = z.infer<typeof messageSchema>;

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessageReceiver, setNewMessageReceiver] = useState<SelectUser | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    enabled: !!user,
  });

  const { data: users = [] } = useQuery<SelectUser[]>({
    queryKey: ['/api/users'],
    enabled: !!user && showNewMessage,
  });

  const conversationMessages = selectedConversation 
    ? messages.filter(m => 
        (m.senderId === user?.id && m.receiverId === selectedConversation) ||
        (m.senderId === selectedConversation && m.receiverId === user?.id)
      ).sort((a, b) => new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime())
    : [];

  const conversations = messages.reduce((acc: any[], message) => {
    const otherUserId = message.senderId === user?.id ? message.receiverId : message.senderId;
    if (!acc.find(conv => conv.userId === otherUserId)) {
      const lastMessage = messages
        .filter(m => 
          (m.senderId === user?.id && m.receiverId === otherUserId) ||
          (m.senderId === otherUserId && m.receiverId === user?.id)
        )
        .sort((a, b) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime())[0];
      
      acc.push({
        userId: otherUserId,
        lastMessage,
        unreadCount: messages.filter(m => 
          m.senderId === otherUserId && 
          m.receiverId === user?.id && 
          !m.read
        ).length
      });
    }
    return acc;
  }, []);

  const form = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: '',
      receiverId: 0,
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: InsertMessage) => {
      return await apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      form.reset();
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSendMessage = (data: MessageForm) => {
    if (!user || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      content: data.content,
      senderId: user.id,
      receiverId: selectedConversation,
      read: false,
    });
  };

  const startNewConversation = (receiverUser: SelectUser) => {
    setSelectedConversation(receiverUser.id);
    setNewMessageReceiver(receiverUser);
    setShowNewMessage(false);
    form.setValue('receiverId', receiverUser.id);
  };

  const handleBookAppointment = (doctorId: number) => {
    // This would typically navigate to appointment booking
    toast({
      title: 'Appointment Booking',
      description: 'Appointment booking feature will be implemented.',
    });
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <p className="text-gray-600">Please log in to access messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <Button
                onClick={() => setShowNewMessage(true)}
                className="bg-orange-600 hover:bg-orange-700 text-sm px-3 py-1"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a new conversation</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.userId}
                  onClick={() => setSelectedConversation(conv.userId)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation === conv.userId ? 'bg-orange-50 border-orange-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        User #{conv.userId}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            {conv.unreadCount}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        User #{selectedConversation}
                      </h3>
                      <p className="text-sm text-gray-500">Healthcare Professional</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleBookAppointment(selectedConversation)}
                      className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm px-3 py-1"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Book Appointment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p>No messages in this conversation</p>
                    <p className="text-sm">Send a message to get started</p>
                  </div>
                ) : (
                  conversationMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === user.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === user.id
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === user.id
                              ? 'text-orange-100'
                              : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.timestamp || '').toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSendMessage)} className="flex space-x-2">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Type your message..."
                              className="flex-1"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      disabled={sendMessageMutation.isPending}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p>Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>Start New Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-2">
                {users
                  .filter(u => u.id !== user.id)
                  .map((otherUser) => (
                    <div
                      key={otherUser.id}
                      onClick={() => startNewConversation(otherUser)}
                      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          {otherUser.userType === 'doctor' ? (
                            <Stethoscope className="h-4 w-4 text-gray-600" />
                          ) : (
                            <User className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {otherUser.firstName} {otherUser.lastName}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {otherUser.userType}
                            {otherUser.specialty && ` • ${otherUser.specialty}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <Button
                onClick={() => setShowNewMessage(false)}
                className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}