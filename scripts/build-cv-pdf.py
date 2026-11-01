#!/usr/bin/env python3
"""Render the published CV PDF from one plain-text source.

LibreOffice on this machine cannot load .docx ("source file could not be
loaded", reproduced even on a minimal valid file), so the published PDF is
typeset here and rendered with chromium, the same engine already used for the
site's images.

The content mirrors ~/Documents/CV/Matt_Karimov_CV.docx with ONE deliberate
difference: the personal mobile number is omitted, because the published file
is a permanent, search-indexed, scrapeable URL. Email and LinkedIn remain.

    python3 scripts/build-cv-pdf.py

Output: public/cv/matt-karimov-cv.pdf
Update CV_VERSION here and CV_VERSION in src/app/page.tsx together.
"""

from __future__ import annotations

import html
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "cv" / "matt-karimov-cv.pdf"

CV_VERSION = "November 2026"

FACE = '''@font-face {{ font-family:"Inter"; src:url("file://{root}/public/fonts/inter-latin.woff2") format("woff2"); font-weight:100 900; font-style:normal; }}
@font-face {{ font-family:"Playfair Display"; src:url("file://{root}/public/fonts/playfair-latin.woff2") format("woff2"); font-weight:400 900; font-style:normal; }}'''

NAME = "Matt Karimov"
HEADLINE = "Test Automation Engineer | AI Quality &amp; LLM Evaluation"
CONTACT = [
    "Liverpool, UK",
    '<a href="mailto:mattkarimov@outlook.com">mattkarimov@outlook.com</a>',
    '<a href="https://www.linkedin.com/in/mattkari">linkedin.com/in/mattkari</a>',
    '<a href="https://github.com/mattkari">github.com/mattkari</a>',
]

SUMMARY = (
    "Test automation engineer with 5+ years of Java-based automation and 8+ years in UK "
    "financial services (Barclays, NatWest, Lloyds Banking Group, HSBC), now applying that "
    "testing discipline to AI systems. Builds automation frameworks for REST APIs, "
    "microservices and web UIs with Java, Karate DSL, Cucumber, Playwright, Selenium and "
    "REST Assured, integrated into GitLab CI and Jenkins. Experienced in payments platforms "
    "(SEPA, instant payments, ICON IPF), Kafka event streams, SQL and MongoDB data "
    "validation, and root-cause analysis in regulated environments. Built a public "
    "retrieval-augmented generation (RAG) system in Python that cites every answer to a "
    "printed page number and refuses when its evidence is insufficient, treating "
    "hallucination and traceability as testable properties."
)

SKILLS = [
    ("Programming", "Java 17 (OOP), Python, SQL, Gherkin, Ruby"),
    ("AI and LLM Engineering",
     "Retrieval-augmented generation (RAG), embeddings and vector retrieval, Anthropic Claude API, "
     "OpenAI API, prompt versioning, citation grounding, output validation, LLM-assisted and "
     "agentic coding workflows"),
    ("Python Tooling", "PyMuPDF, NumPy, Streamlit, tiktoken"),
    ("Test Automation",
     "Karate DSL, Cucumber-JVM (BDD), Playwright, Selenium WebDriver, JUnit, TestNG, JBehave, PicoContainer"),
    ("API Testing", "REST Assured, Karate, Postman, REST APIs, OpenAPI, JSON, XML"),
    ("Messaging and Data", "Kafka, SQL, MongoDB"),
    ("CI/CD and DevOps", "GitLab CI/CD, Jenkins, Maven, Docker, Kubernetes, AWS (EC2)"),
    ("Test Management", "Xray for Jira, Jira, test planning and execution"),
    ("Version Control", "Git, GitLab, Bitbucket"),
    ("Integration Frameworks", "ICON IPF (3+ years)"),
    ("Design and Practice",
     "Page Object Model, Strategy Pattern, BDD, TDD, microservices and distributed-system testing, Agile Scrum"),
    ("Domain Knowledge", "Financial services, banking, payments"),
]

PROJECT = {
    "name": "Source-Grounded RAG Research Assistant",
    "meta": 'Python | <a href="https://github.com/mattkari/source-grounded-rag">github.com/mattkari/source-grounded-rag</a>',
    "bullets": [
        "Built a retrieval-augmented question-answering system over a 288-page doctoral thesis that answers only from its source collection and refuses when the retrieved evidence is insufficient.",
        "Engineered PDF extraction with PyMuPDF that records the page number printed on each page and its chapter, then chunked text within chapter boundaries (about 700 tokens, 15% overlap) so no citation can span two chapters: 288 pages into 266 chunks.",
        "Designed citations so the model emits only opaque evidence handles and the renderer resolves page numbers from stored provenance, so a page number can never be invented; every answer passes blocking post-generation validation before it is shown.",
        "Audited provenance against the source PDF: 266 of 266 chunks carry the page label actually printed on their pages, and every word of every chunk appears on the pages it claims.",
        "Kept runs reproducible with versioned prompts, recorded query runs and swappable embedding and generation providers (OpenAI embeddings, Anthropic Claude, Ollama fallback); shipped a CLI and a Streamlit web UI, containerised with Docker and self-hosted on a Raspberry Pi.",
    ],
    "tech": "Python, PyMuPDF, NumPy, OpenAI embeddings, Anthropic Claude, Streamlit, Docker",
}

ROLES = [
    {
        "title": "Test Automation Engineer",
        "org": "Barclays, UK",
        "dates": "02/2026 \u2013 Present",
        "bullets": [
            "Design and maintain API test automation in Karate DSL on Java 17 with Cucumber-JVM and Maven, validating REST services for banking applications in a regulated environment.",
            "Build end-to-end UI automation with Playwright for Java, using PicoContainer dependency injection to manage shared state across Cucumber step definitions.",
            "Implement safe Java interop patterns between Karate feature files and Java helper classes to keep test code reusable and maintainable.",
            "Containerise Playwright execution with multi-stage Docker images and parallel shard profiles for CI runs.",
            "Integrate automated suites into GitLab CI pipelines and import Cucumber results into Xray for Jira through its REST API for requirement-level traceability.",
            "Defined a three-tier Xray tagging taxonomy separating manual, automated and hybrid tests to keep coverage reporting consistent.",
            "Evaluated OpenAPI contract validation within Karate using swagger-request-validator to detect drift between services and their specifications.",
            "Apply LLM-assisted and agentic coding workflows to test authoring and framework maintenance, reviewing and validating AI-generated test code before it enters the suite.",
        ],
        "tech": "Java 17, Karate DSL, Cucumber-JVM, PicoContainer, Playwright, Maven, GitLab CI/CD, Docker, Xray for Jira, Jira, REST APIs, OpenAPI, JSON, Git",
    },
    {
        "title": "Quality Automation Specialist",
        "org": "NatWest Group, UK",
        "dates": "02/2022 \u2013 01/2026",
        "bullets": [
            "Designed and extended Java automation frameworks for ICON IPF-based payment microservices handling high-volume payment processing, enhancing the framework with REST Assured and a Strategy Pattern implementation.",
            "Built REST API tooling in Java and REST Assured, working with backend engineers to define API contracts, improve schema consistency and validate behaviour across distributed services.",
            "Supported production debugging through root-cause analysis of failures across APIs, Kafka event streams and SQL and MongoDB data layers.",
            "Analysed API health, latency and data-flow bottlenecks across containerised, event-driven microservices to improve reliability.",
            "Implemented TDD-aligned testing strategies in CI/CD pipelines, expanding automated integration coverage and reducing deployment risk.",
            "Mentored engineers in Java best practices, API lifecycle and distributed-system quality patterns.",
        ],
        "tech": "ICON IPF, Java, REST Assured, Kafka, Selenium WebDriver, JBehave, Cucumber BDD, JUnit, SQL, MongoDB, Docker, Kubernetes, Jenkins, GitLab CI/CD, Git, Bitbucket, Jira, Maven, XML, JSON",
    },
    {
        "title": "QA Automation Engineer",
        "org": "Amplience, UK",
        "dates": "04/2021 \u2013 01/2022",
        "bullets": [
            "Designed and implemented a test automation framework using Java, Selenium WebDriver, Cucumber BDD, TestNG and the Page Object Model.",
            "Integrated automated tests into CI/CD using Jenkins on AWS EC2 for continuous quality validation.",
            "Tested REST APIs and JSON schemas with REST Assured and Postman, and verified data consistency and integrity in MongoDB.",
            "Executed exploratory, integration, end-to-end, smoke, regression and UI testing.",
            "Led bug triage in Agile Scrum ceremonies and contributed to design discussions, acceptance criteria and peer code reviews.",
        ],
        "tech": "Java, Ruby, Selenium WebDriver, Cucumber BDD, TestNG, JUnit, REST Assured, Postman, MongoDB, Docker, Jenkins, Git, Maven, Jira, AWS EC2",
    },
    {
        "title": "Complaints Manager (Testing and Validation Focus)",
        "org": "Lloyds Banking Group, UK",
        "dates": "11/2017 \u2013 01/2021",
        "bullets": [
            "Led manual and automated testing of banking redress calculators, ensuring accuracy and compliance in Asset Finance Payment Protection Insurance claims processing.",
            "Performed SQL database testing and data-driven validation to improve the accuracy and efficiency of claim processes.",
            "Conducted root-cause analysis on defects and system issues, driving product and quality improvements.",
            "Served as Subject Matter Expert in redress calculations, training team members on testing best practice.",
        ],
        "tech": "Manual testing, SQL, data validation, verification, financial services",
    },
    {
        "title": "Quality Assurance Representative",
        "org": "HSBC, Leeds, UK",
        "dates": "05/2017 \u2013 11/2017",
        "bullets": [
            "Conducted manual testing, verification and validation of complex financial calculators for payment protection insurance complaints.",
            "Performed SQL database testing and data reviews, ensuring data accuracy and integrity.",
            "Executed root-cause analysis on sensitive banking data, contributing to quality improvement initiatives.",
        ],
        "tech": "Manual testing, SQL, validation, verification, banking compliance",
    },
]

EDUCATION = [
    ("Full Stack Automation Tester (SDET) Program", "Cydeo, Virginia, USA", "2020"),
    ("PhD in Governance and International Affairs", "Durham University, UK", "2018 (thesis submitted 2017)"),
    ("MA in Public Administration", "JMI Central University, New Delhi, India", "2006"),
    ("BA in Legal Studies", "TIU University, Tashkent, Uzbekistan", "2003"),
]

CSS = """
@page { size: A4; margin: 14mm 15mm; }
* { box-sizing: border-box; }
body { margin:0; font-family: Inter, "Helvetica Neue", Arial, sans-serif;
  font-size: 9.6pt; line-height: 1.42; color:#1e293b; }
a { color:#1d4ed8; text-decoration:none; }
h1 { font-size: 21pt; margin:0; letter-spacing:-.01em; color:#0f172a; font-weight:700; }
.headline { font-size:10.6pt; color:#b45309; font-weight:600; margin:3px 0 5px; }
.contact { font-size:9pt; color:#475569; }
.contact span + span::before { content:" | "; color:#cbd5e1; }
.rule { height:2px; background:#f59e0b; margin:9px 0 13px; }
h2 { font-size:9.6pt; text-transform:uppercase; letter-spacing:.14em; color:#0f172a;
  margin:14px 0 6px; padding-bottom:3px; border-bottom:1px solid #e2e8f0; font-weight:700; }
p { margin:0 0 6px; text-align:justify; }
.kv { display:grid; grid-template-columns: 142px 1fr; gap:2px 10px; }
.kv dt { font-weight:600; color:#0f172a; }
.kv dd { margin:0; }
.role { margin:0 0 9px; break-inside:avoid; }
.role-head { display:flex; justify-content:space-between; align-items:baseline; gap:12px; }
.role-title { font-weight:700; color:#0f172a; font-size:10.4pt; }
.role-dates { font-size:8.8pt; color:#64748b; white-space:nowrap; }
.role-org { font-size:9.4pt; color:#b45309; font-weight:600; margin:1px 0 4px; }
ul { margin:0; padding-left:15px; }
li { margin:2px 0; }
li::marker { color:#f59e0b; }
.tech { font-size:8.8pt; color:#475569; margin-top:4px; }
.tech b { color:#0f172a; }
.edu { display:grid; grid-template-columns: 1fr auto; gap:2px 12px; }
.edu .what { font-weight:600; color:#0f172a; }
.edu .where { color:#475569; }
.edu .yr { color:#64748b; font-size:8.8pt; text-align:right; }
.foot { margin-top:12px; padding-top:7px; border-top:1px solid #e2e8f0;
  font-size:8pt; color:#94a3b8; display:flex; justify-content:space-between; }
"""


def role_html(role: dict) -> str:
    items = "".join(f"<li>{html.escape(b)}</li>" for b in role["bullets"])
    return f"""<div class="role">
<div class="role-head"><span class="role-title">{html.escape(role['title'])}</span>
<span class="role-dates">{role['dates']}</span></div>
<div class="role-org">{html.escape(role['org'])}</div>
<ul>{items}</ul>
<div class="tech"><b>Technologies:</b> {html.escape(role['tech'])}</div>
</div>"""


def build_html() -> str:
    skills = "".join(
        f"<dt>{html.escape(k)}</dt><dd>{html.escape(v)}</dd>" for k, v in SKILLS
    )
    proj_items = "".join(f"<li>{html.escape(b)}</li>" for b in PROJECT["bullets"])
    roles = "".join(role_html(r) for r in ROLES)
    edu = "".join(
        f'<div class="what">{html.escape(w)}</div><div class="yr">{y}</div>'
        f'<div class="where">{html.escape(s)}</div><div></div>'
        for w, s, y in EDUCATION
    )
    contact = "".join(f"<span>{c}</span>" for c in CONTACT)
    return f"""<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
<title>{NAME} \u2014 CV</title>
<style>{FACE.format(root=ROOT)}\n{CSS}</style></head><body>
<h1>{NAME}</h1>
<div class="headline">{HEADLINE}</div>
<div class="contact">{contact}</div>
<div class="rule"></div>

<h2>Professional summary</h2>
<p>{html.escape(SUMMARY)}</p>

<h2>Technical skills</h2>
<dl class="kv">{skills}</dl>

<h2>Projects</h2>
<div class="role">
<div class="role-head"><span class="role-title">{html.escape(PROJECT['name'])}</span></div>
<div class="role-org">{PROJECT['meta']}</div>
<ul>{proj_items}</ul>
<div class="tech"><b>Technologies:</b> {html.escape(PROJECT['tech'])}</div>
</div>

<h2>Professional experience</h2>
{roles}

<h2>Education</h2>
<div class="edu">{edu}</div>

<div class="foot"><span>{NAME} \u2014 CV, {CV_VERSION}</span><span>mattkari.github.io</span></div>
</body></html>"""


def main() -> int:
    chromium = shutil.which("chromium") or shutil.which("chromium-browser")
    if not chromium:
        print("chromium not found", file=sys.stderr)
        return 1
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as fh:
        fh.write(build_html())
        tmp = fh.name
    # browser_exec holds chromium's default profile, so give this render its own
    profile = tempfile.mkdtemp(prefix="chrome-cv-")
    subprocess.run(
        [chromium, "--headless=new", "--disable-gpu", "--no-sandbox",
         f"--user-data-dir={profile}", "--no-pdf-header-footer",
         f"--print-to-pdf={OUT}", f"file://{tmp}"],
        check=True, capture_output=True, timeout=180,
    )
    Path(tmp).unlink(missing_ok=True)
    shutil.rmtree(profile, ignore_errors=True)
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size:,} bytes), version {CV_VERSION}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
