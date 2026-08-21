# Documentation Index

This folder contains all feature specifications, templates, and development guides for Gym AI.

---

## 📚 Documentation Files

### 🎯 For Planning Features

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[FEATURE_TEMPLATE.md](FEATURE_TEMPLATE.md)** | Complete feature specification template | Copy this for EVERY new feature before starting development |
| **[FEATURE_DEVELOPMENT_GUIDE.md](FEATURE_DEVELOPMENT_GUIDE.md)** | How to use the template + best practices | Read this first to understand how to fill out the template |

### 📋 Design Files

| Folder/File | Purpose |
|-------------|---------|
| `designs/` | Stitch mockups and design exports |
| `designs/[feature-name]/` | Design files organized by feature |

---

## 🚀 Quick Start

### Starting a New Feature?

1. **Read the guide first:**
   ```bash
   # Open and read
   docs/FEATURE_DEVELOPMENT_GUIDE.md
   ```

2. **Copy the template:**
   ```bash
   # Create your feature spec
   cp docs/FEATURE_TEMPLATE.md docs/features/[YOUR-FEATURE-NAME].md
   ```

3. **Fill it out:**
   - Follow the order in the Development Guide
   - Reference your Stitch designs
   - Be thorough but concise
   - Takes ~4-5 hours for a medium feature

4. **Review with team** before coding

5. **Keep it updated** as requirements change

---

## 📁 Folder Structure

```
docs/
├── README.md                          ← You are here
├── FEATURE_TEMPLATE.md                ← Copy this for each feature
├── FEATURE_DEVELOPMENT_GUIDE.md       ← How to use the template
├── WIREFRAME-BRIEF.md                 ← Your existing wireframe doc
├── features/                          ← Completed feature specs go here
│   ├── personalized-routines.md
│   ├── exercise-substitution.md
│   ├── volume-optimization.md
│   └── workout-logging.md
└── designs/                           ← Design files from Stitch
    ├── onboarding/
    ├── session/
    ├── progress/
    └── routines/
```

---

## ✅ Feature Development Workflow

```
1. Design Phase (In Stitch)
   ↓
2. Copy Template
   ↓
3. Fill Out Spec (use Development Guide)
   ↓
4. Review with Team
   ↓
5. Mark as "Ready for Development"
   ↓
6. Implement Feature
   ↓
7. Update Spec if Requirements Change
   ↓
8. Test Against Acceptance Criteria
   ↓
9. Mark as "Done"
```

---

## 🎯 4 Core Features

Based on `FOUNDATION_COMPLETE.md`, your team is building:

| Feature | Owner | Spec File | Status |
|---------|-------|-----------|--------|
| **Personalized Routines** | [Team A] | `features/personalized-routines.md` | 📝 Planning |
| **Exercise Substitutions** | [Team B] | `features/exercise-substitution.md` | 📝 Planning |
| **Volume Optimization** | [Team C] | `features/volume-optimization.md` | 📝 Planning |
| **Workout Logging** | [Team D] | `features/workout-logging.md` | 📝 Planning |

---

## 🔗 Related Documentation

**Project Root:**
- `README.md` - Project overview and tech stack
- `SETUP_GUIDE.md` - How to set up the project locally
- `FOUNDATION_COMPLETE.md` - What's built and ready to use
- `CLAUDE.md` - Development guidelines and patterns
- `PROJECT_STRUCTURE.md` - File organization

**For Developers:**
- `lib/ai/prompts.ts` - AI prompt templates (already built)
- `lib/constants.ts` - Training science rules and constants
- `types/index.ts` - All TypeScript type definitions

---

## 💡 Tips

### Before Starting Development

- [ ] Read `FOUNDATION_COMPLETE.md` to see what's already built
- [ ] Review the reference pattern (API → query → hook → component)
- [ ] Check `lib/utils/` for existing utilities you can reuse
- [ ] Look at `lib/ai/service.ts` for AI integration patterns

### While Writing Spec

- [ ] Be specific, not vague
- [ ] Include real examples (JSON, error messages)
- [ ] Document all error cases
- [ ] Think through edge cases
- [ ] Reference Stitch designs by file name
- [ ] Update as you learn more

### Before Development

- [ ] Get team review on spec
- [ ] Confirm all Stitch designs are final
- [ ] Verify dependencies are ready
- [ ] Check for API/database requirements

---

## 🆘 Need Help?

**Questions about:**
- **The template?** → Read `FEATURE_DEVELOPMENT_GUIDE.md`
- **Project setup?** → Check `../SETUP_GUIDE.md`
- **What's built?** → See `../FOUNDATION_COMPLETE.md`
- **Coding patterns?** → Read `../CLAUDE.md`

**Still stuck?**
- Ask your team lead
- Review similar features
- Check existing code patterns

---

## 📊 Spec Status Legend

- 📝 **Planning** - Template copied, filling out
- 👀 **Review** - Complete, waiting for team review
- ✅ **Approved** - Ready for development
- 🔄 **In Progress** - Being implemented
- ✔️ **Done** - Implemented and tested

---

**Last Updated:** August 21, 2026  
**Maintained By:** Development Team
