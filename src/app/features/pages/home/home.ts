import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, inject, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AiAgent } from '../../services/ai-agent';
import { ChatMessage } from '../../Interfaces/chat-message';



@Component({
  imports: [CommonModule],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements AfterViewChecked, OnDestroy {
  @ViewChild('composerInput') private composerInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('messagesPanel') private messagesPanel?: ElementRef<HTMLDivElement>;

  draft = '';
  isThinking = false;
  loadingStatus = '';
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
  private loadingStatusTimeout?: ReturnType<typeof setTimeout>;
  private loadingStatusInterval?: ReturnType<typeof setInterval>;
  private readonly loadingStatuses = [
    'جارٍ البحث عن المعلومات',
    'جارٍ الحصول على البيانات',
    'جارٍ تجهيز الإجابة',
    'نراجع النتائج الأخيرة',
  ];




  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.stopLoadingStatus();
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
    this.startLoadingStatus();

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
          text: this.formatAnswer(response.answer),
          createdAt: new Date(),
          sources: chatSources
        });
        this.isThinking = false;
        this.stopLoadingStatus();
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
        this.stopLoadingStatus();
        this.cdr.detectChanges();
      }
    });
  }

  private formatAnswer(answer: string): string {
    return answer.replace(/\s*(\[s\s*\d+\])/gi, '\n$1').trim();
  }

  private startLoadingStatus(): void {
    this.stopLoadingStatus();
    this.loadingStatus = '';

    this.loadingStatusTimeout = setTimeout(() => {
      let statusIndex = 0;
      this.loadingStatus = this.loadingStatuses[statusIndex];
      this.cdr.detectChanges();

      this.loadingStatusInterval = setInterval(() => {
        statusIndex = (statusIndex + 1) % this.loadingStatuses.length;
        this.loadingStatus = this.loadingStatuses[statusIndex];
        this.cdr.detectChanges();
      }, 4000);
    }, 3000);
  }

  private stopLoadingStatus(): void {
    if (this.loadingStatusTimeout) {
      clearTimeout(this.loadingStatusTimeout);
      this.loadingStatusTimeout = undefined;
    }

    if (this.loadingStatusInterval) {
      clearInterval(this.loadingStatusInterval);
      this.loadingStatusInterval = undefined;
    }

    this.loadingStatus = '';
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
