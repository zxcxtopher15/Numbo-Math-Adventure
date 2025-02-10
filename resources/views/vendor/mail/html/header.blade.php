@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
@if (trim($slot) === 'Numbo Math Adventure')
<img src="{{ url('/images/logo.png') }}" class="logo" alt="App Logo">
@else
{{ $slot }}
@endif
</a>
</td>
</tr>
