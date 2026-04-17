<?php
declare(strict_types=1);

header('Content-Type: text/html; charset=utf-8');

$links = [
    ['/api/health', 'Health'],
    ['/api/tournaments', 'Tournaments'],
    ['/api/matches', 'Matches'],
    ['/api/news', 'News'],
    ['/api/media/albums', 'Media albums'],
    ['/api/clubs', 'Clubs'],
    ['/api/pages/contacts', 'Contacts page'],
];

echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Burchalkin Cup LAMP API</title></head><body>';
echo '<h1>Burchalkin Cup LAMP API</h1>';
echo '<ul>';
foreach ($links as [$href, $label]) {
    echo '<li><a href="' . htmlspecialchars($href, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '">' . htmlspecialchars($label, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</a></li>';
}
echo '</ul>';
echo '</body></html>';
