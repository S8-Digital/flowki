<?php

namespace App\Jobs;

use App\Models\Chore;
use App\Models\Todo;
use App\Notifications\ChoreDueReminder;
use App\Notifications\TodoDueReminder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class SendDueItemReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $this->sendTodoReminders();
        $this->sendChoreReminders();
    }

    private function sendTodoReminders(): void
    {
        // Fetch todos that have reminders enabled and are not yet completed
        Todo::query()
            ->where('reminder_enabled', true)
            ->whereNotNull('due_date')
            ->whereNotNull('assigned_to')
            ->where('status', '!=', 'completed')
            ->with('assignee')
            ->get()
            ->each(function (Todo $todo) {
                if (! $todo->assignee) {
                    return;
                }

                $reminderAt = Carbon::parse($todo->due_date)->subMinutes($todo->reminder_lead_time);

                // Send if the reminder window is now (within the last minute)
                if ($reminderAt->between(now()->subMinute(), now())) {
                    $todo->assignee->notify(new TodoDueReminder($todo));
                }
            });
    }

    private function sendChoreReminders(): void
    {
        Chore::query()
            ->where('reminder_enabled', true)
            ->whereNotNull('next_due_date')
            ->with('assignees')
            ->get()
            ->each(function (Chore $chore) {
                $reminderAt = Carbon::parse($chore->next_due_date)->subMinutes($chore->reminder_lead_time);

                if (! $reminderAt->between(now()->subMinute(), now())) {
                    return;
                }

                foreach ($chore->assignees as $assignee) {
                    $assignee->notify(new ChoreDueReminder($chore));
                }
            });
    }
}
