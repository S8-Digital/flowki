<?php

declare(strict_types=1);

namespace App\Console\Commands\Firebase;

use Illuminate\Console\Command;
use Kreait\Firebase\Contract\RemoteConfig;
use Kreait\Firebase\RemoteConfig\Parameter;
use Kreait\Firebase\RemoteConfig\ParameterValueType;
use Kreait\Firebase\RemoteConfig\Template;
use RuntimeException;

class SyncRemoteConfigCommand extends Command
{
    protected $signature = 'firebase:sync-remote-config
                            {--dry-run : Validate the template without publishing}';

    protected $description = 'Upload the Remote Config defaults from remote-config-defaults.json to Firebase';

    /**
     * Path to the JSON file that is the single source of truth for both
     * the TypeScript client-side defaults and this command.
     */
    private const DEFAULTS_FILE = 'resources/js/lib/remote-config-defaults.json';

    public function handle(RemoteConfig $remoteConfig): int
    {
        $defaults = $this->loadDefaults();

        $this->info('Fetching current Remote Config template…');
        $template = $remoteConfig->get();
        $template = $this->applyDefaults($template, $defaults);

        $this->info('Prepared '.count($defaults).' parameters.');

        if ($this->option('dry-run')) {
            $this->info('Validating template (dry-run)…');
            $remoteConfig->validate($template);
            $this->info('✓ Template is valid. No changes published.');

            return self::SUCCESS;
        }

        $this->info('Publishing template…');
        $remoteConfig->publish($template);
        $this->info('✓ Remote Config defaults published successfully.');

        return self::SUCCESS;
    }

    /**
     * @return array<string, mixed>
     */
    private function loadDefaults(): array
    {
        $path = base_path(self::DEFAULTS_FILE);

        if (! file_exists($path)) {
            throw new RuntimeException("Remote Config defaults file not found: {$path}");
        }

        /** @var array<string, mixed> $decoded */
        $decoded = json_decode(file_get_contents($path), associative: true, flags: JSON_THROW_ON_ERROR);

        return $decoded;
    }

    /**
     * @param  array<string, mixed>  $defaults
     */
    private function applyDefaults(Template $template, array $defaults): Template
    {
        foreach ($defaults as $key => $value) {
            [$stringValue, $valueType] = match (true) {
                is_bool($value) => [$value ? 'true' : 'false', ParameterValueType::BOOL],
                is_array($value) => [json_encode($value, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), ParameterValueType::JSON],
                default => [(string) $value, ParameterValueType::STRING],
            };

            $template = $template->withParameter(
                Parameter::named($key, $stringValue, $valueType),
            );
        }

        return $template;
    }
}
