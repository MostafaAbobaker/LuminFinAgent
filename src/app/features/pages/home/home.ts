import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';

interface ChatSource {
  title: string;
  url: string;
  snippet: string;
}

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  createdAt: Date;
  sources?: ChatSource[];
}

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
  selectedAttachmentName = '';
  messages: ChatMessage[] = [
    {
      id: 1,
      role: 'assistant',
      text: 'مرحباً، أنا المساعد الذكي لوزارة المالية. أقدر أساعدك في تحليل البيانات، التقارير، والمقترحات المالية. ما الذي تريد الاستفسار عنه؟',
      createdAt: new Date(),
    },
  ];

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

  triggerAttachment(): void {
    const fileInput = document.getElementById('chat-attachment-input') as HTMLInputElement | null;
    fileInput?.click();
  }

  handleAttachment(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.selectedAttachmentName = file.name;
    input.value = '';
  }

  sendMessage(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    const trimmed = this.draft.trim();
    const hasAttachment = !!this.selectedAttachmentName;

    if (!trimmed && !hasAttachment) {
      return;
    }

    if (this.isThinking) {
      return;
    }

    const userText = trimmed || `تم إرفاق الملف: ${this.selectedAttachmentName}`;

    this.messages.push({
      id: Date.now(),
      role: 'user',
      text: userText,
      createdAt: new Date(),
    });

    this.draft = '';
    this.selectedAttachmentName = '';
    this.isThinking = true;

    const targetInput = this.composerInput?.nativeElement;
    if (targetInput) {
      targetInput.value = '';
      this.resizeTextarea(targetInput);
      targetInput.focus();
    }

    window.setTimeout(() => {
      this.messages.push(this.buildAssistantReply(userText));
      this.isThinking = false;
    }, 1800);
  }

  private buildAssistantReply(question: string): ChatMessage {
    const lowerQuestion = question.toLowerCase();
    const isFinanceReportQuery = lowerQuestion.includes('تقرير') || lowerQuestion.includes('تقارير') || lowerQuestion.includes('ميزانية') || lowerQuestion.includes('مالي') || lowerQuestion.includes('المالية');

    const text = isFinanceReportQuery
      ? 'بناءً على آخر التقارير المالية المتاحة، الأداء العام مستقر وموجه نحو التحسين، مع استمرار التوزيع الاستراتيجي للموارد في القطاعات ذات الأولوية. يمكننا التعمق في تفاصيل النفقات أو الإيرادات إذا رغبت.'
      : 'تم استلام طلبك، وتم تجهيز الإجابة بناءً على البيانات المتاحة في التقارير الداخلية ذات الصلة. أستطيع أن أشرح الأرقام، أراجع الفروقات، أو أساعد في رسم تصور مالي سريع.';

    return {
      id: Date.now() + 1,
      role: 'assistant',
      text,
      createdAt: new Date(),
      sources: [
        {
          title: 'تقرير الأداء المالي - الربع الثالث',
          url: '#',
          snippet: 'مؤشرات الإيرادات والنفقات وتوزيع الموارد حسب المحاور الاستراتيجية.',
        },
        {
          title: 'ملف الموازنة السنوية',
          url: '#',
          snippet: 'تحليل التخصيصات والالتزامات المالية للقطاعات التشغيلية.',
        },
      ],
    };
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
