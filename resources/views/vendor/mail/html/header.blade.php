@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block; text-decoration: none;">
<img src="{{ config('app.url') }}/images/logo.png" class="logo" alt="{{ config('app.name') }}">
</a>
</td>
</tr>
