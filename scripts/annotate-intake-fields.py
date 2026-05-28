#!/usr/bin/env python3
"""Add name and data-field attributes to WIN intake form controls."""
import re
from pathlib import Path

# Display label (as in HTML) -> field key
LABELS = {
    "First Name": "first_name",
    "Last Name": "last_name",
    "Email Address": "email",
    "Contact Number": "phone",
    "Phone Number": "phone",
    "Street Address": "street_address",
    "Address Line 2": "address_line2",
    "City": "city",
    "State": "state",
    "ZIP Code": "zip",
    "Branch of Service": "branch_of_service",
    "Current Military Status": "military_status",
    "Discharge Status": "discharge_status",
    "Rank at Discharge / Current Rank": "rank",
    "Enlistment Date": "enlistment_date",
    "Expected / Actual Separation Date": "separation_date",
    "MOS / AFSC / Rate": "mos_afsc_rate",
    "Aviation Maintenance Experience": "aviation_maint_exp",
    "General Mechanical Experience": "mechanical_exp",
    "Currently Enrolled in Training Program?": "enrolled_training",
    "Completed Any Aviation / Mechanical Certifications?": "av_mech_certs",
    "FAA Written Exams Completed": "faa_written_exams",
    "Scheduled for FAA Oral & Practical Exam?": "faa_oral_practical",
    "Current Employment Status": "employment_status",
    "Willing to Relocate?": "willing_relocate",
    "Preferred Geographic Locations": "preferred_locations",
    "Resume Prepared?": "resume_prepared",
    "Interested in Mentorship / Career Guidance?": "mentorship_interest",
    "Support Needed": "support_needed",
    "How Did You Hear About WIN?": "referral_source",
    "Additional Information": "additional_info",
    "Company Name": "company_name",
    "Job Title": "job_title",
    "Company Website": "company_website",
    "Organization Type": "org_type",
    "Currently Hiring?": "currently_hiring",
    "Geographic Hiring Locations": "hiring_locations",
    "Anticipated Annual Hires": "annual_hires",
    "Roles Most Frequently Hiring For": "roles_hiring",
    "Currently Hire Veterans / Transitioning Military?": "hire_veterans",
    "Preferred Contact Method": "preferred_contact",
    "Partnership Interest with WIN": "partnership_interest",
    "Areas of Interest to Discuss with WIN": "areas_of_interest",
    "Schedule an Introductory Call with WIN?": "schedule_call",
    "Organization / Company Name": "company_name",
    "Type of Support Interested In": "support_types",
    "Interested in Recurring Support?": "recurring_support",
    "Interested in Sponsorship / Partnership Packages?": "sponsorship_packages",
    "Estimated Level of Support / Contribution Interest": "contribution_level",
    "How Would You Prefer to Stay Engaged with WIN?": "engagement_preferences",
}

path = Path(__file__).resolve().parent.parent / "index.html"
html = path.read_text(encoding="utf-8")
start = html.index('<form class="intake-form" id="intake-form"')
end = html.index("</form>", start) + len("</form>")
section = html[start:end]
count = [0]

for label, key in sorted(LABELS.items(), key=lambda x: -len(x[0])):
    esc = re.escape(label)
    label_pat = rf"<label>\s*{esc}\s*(?:<span[^>]*>[^<]*</span>\s*)*(?:<span[^>]*>[^<]*</span>\s*)*</label>"

    # Checkbox groups
    cb_pat = label_pat + r"\s*<div class=\"intake-checkboxes\">([\s\S]*?)</div>"
    def cb_repl(m):
        inner = m.group(1)
        if f'data-field="{key}"' in inner:
            return m.group(0)
        inner2 = re.sub(
            r'<input type="checkbox"(?![^>]*data-field)',
            f'<input type="checkbox" name="{key}" data-field="{key}"',
            inner,
        )
        count[0] += inner2.count("data-field=") - inner.count("data-field=")
        return m.group(0).replace(inner, inner2)

    section = re.sub(cb_pat, cb_repl, section, flags=re.I)

    # Single controls on same line or next
    ctrl_pat = label_pat + r"[\s\S]{0,120}?<(input|select|textarea)\b([^>]*?)(/?>)"

    def ctrl_repl(m):
        full = m.group(0)
        if "data-field=" in full:
            return full
        tag = f"<{m.group(1)}{m.group(2)}{m.group(3)}"
        new_tag = f'<{m.group(1)} name="{key}" data-field="{key}"{m.group(2)}{m.group(3)}'
        count[0] += 1
        return full.replace(tag, new_tag, 1)

    section = re.sub(ctrl_pat, ctrl_repl, section, flags=re.I)

path.write_text(html[:start] + section + html[end:], encoding="utf-8")
print(f"Annotated {count[0]} controls")
