import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AiAgent } from '../../services/ai-agent';
import { ChatMessage } from '../../Interfaces/chat-message';



@Component({
  imports: [CommonModule],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements AfterViewChecked {
  @ViewChild('composerInput') private composerInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('messagesPanel') private messagesPanel?: ElementRef<HTMLDivElement>;

  draft = '';
  isThinking = false;
  messages: ChatMessage[] = [
    {
      id: 1,
      role: 'assistant',
      text: 'مرحباً، أنا المساعد الذكي لوزارة المالية. أقدر أساعدك في تحليل البيانات، التقارير، والمقترحات المالية. ما الذي تريد الاستفسار عنه؟',
      createdAt: new Date(),
    },
  ];
  private readonly aiAgent= inject(AiAgent);
  private readonly cdr = inject(ChangeDetectorRef);




  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  onDraftChange(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.draft = input.value;
    this.resizeTextarea(input);
  }

  handleComposerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  triggerAttachment(): void {}

  handleAttachment(event: Event): void {}

  sendMessage(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    const trimmed = this.draft.trim();

    if (!trimmed) {
      return;
    }

    if (this.isThinking) {
      return;
    }

    const userText = trimmed;

    this.messages.push({
      id: Date.now(),
      role: 'user',
      text: userText,
      createdAt: new Date(),
    });

    this.draft = '';
    this.isThinking = true;

    const targetInput = this.composerInput?.nativeElement;
    if (targetInput) {
      targetInput.value = '';
      this.resizeTextarea(targetInput);
      targetInput.focus();
    }
    const askValue = {
      question: userText,
      k: 8,
      think: true,
      fast: false,
      show_thinking: false
    }
    // Call the AI Agent API
    this.aiAgent.ask(askValue).subscribe({

      next: (response) => {
        console.log(response);

        // Convert API sources to ChatSource format
        const chatSources = response.sources?.map((source: any) => ({
          title: source.label || source.document,
          url: source.document || source.file || '#',
          snippet: source.citation || '',
          file: source.file,
          page: source.page,
          pdf_page: source.pdf_page,
          label: source.label
        })) || [];

        this.messages.push({
          id: Date.now() + 1,
          role: 'assistant',
          text: response.answer,
          createdAt: new Date(),
          sources: chatSources
        });
        this.isThinking = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('API Error:', error);
        this.messages.push({
          id: Date.now() + 1,
          role: 'assistant',
          text: 'حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً.',
          createdAt: new Date(),
        });
        this.isThinking = false;
        this.cdr.detectChanges();
      }
    });
  }

  private resizeTextarea(element: HTMLTextAreaElement): void {
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 180)}px`;
  }

  private scrollToBottom(): void {
    const panel = this.messagesPanel?.nativeElement;
    if (!panel) {
      return;
    }

    panel.scrollTop = panel.scrollHeight;
  }

  trackMessage(index: number, message: ChatMessage): number {
    return message.id;
  }
}
