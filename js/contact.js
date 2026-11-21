// The site has no backend, so the contact form opens the visitor's email app with the message filled in.
// Change CONTACT_EMAIL to the address that should receive enquiries.
(function () {
    var CONTACT_EMAIL = 'info@uttarakhandtourism.com';
    var form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var f = form.elements;
        if (typeof gtag === 'function') gtag('event', 'contact_form_submit', { form_subject: f.subject.value.slice(0, 100), transport_type: 'beacon' });
        var body = 'Name: ' + f.name.value + '\nEmail: ' + f.email.value + '\nPhone: ' + f.phone.value + '\n\n' + f.message.value;
        window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(f.subject.value) + '&body=' + encodeURIComponent(body);
    });
})();
